import Stripe from 'stripe';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
    const chunks = [];
    for await (const chunk of req) { chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk); }
    return Buffer.concat(chunks);
}

// Secure backend parser to prevent payload spoofing
function getRootDomain(urlString) {
    try { return new URL(urlString).hostname.replace('www.', ''); } 
    catch (e) { return null; }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const rawBody = await getRawBody(req);
    const stripeSig = req.headers['stripe-signature'];
    const nowpaymentsSig = req.headers['x-nowpayments-sig'];

    let newLink = null;

    try {
        // --- STRIPE PARSING ---
        if (stripeSig) {
            const event = stripe.webhooks.constructEvent(rawBody, stripeSig, STRIPE_WEBHOOK_SECRET);
            
            if (event.type === 'checkout.session.completed') {
                const session = event.data.object;
                const fields = session.custom_fields || [];
                
                // Mapped precisely to your Stripe Dashboard configuration
                const siteName = fields.find(f => f.label.custom === 'Platform Designation')?.text?.value || "OLYMPUS NODE";
                const siteUrl = fields.find(f => f.label.custom === 'Secure Protocol')?.text?.value;
                
                if (!siteUrl) return res.status(400).json({ error: 'Missing Secure Protocol URL' });
                
                newLink = { 
                    title: siteName.toUpperCase().substring(0, 25), 
                    url: siteUrl, 
                    root_domain: getRootDomain(siteUrl),
                    category: "featured", // Default for Stripe links
                    payment_status: 'approved' // Matches SQL schema
                };
            } else { return res.status(200).json({ message: 'Ignored event' }); }
        } 
        // --- NOWPAYMENTS PARSING ---
        else if (nowpaymentsSig) {
            const payload = JSON.parse(rawBody.toString('utf8'));
            const sortedParams = JSON.stringify(payload, Object.keys(payload).sort());
            
            const hmac = crypto.createHmac('sha512', NOWPAYMENTS_IPN_SECRET);
            hmac.update(sortedParams);
            if (hmac.digest('hex') !== nowpaymentsSig) return res.status(401).json({ error: 'Invalid Crypto Sig' });

            if (payload.payment_status === 'finished') {
                if (!payload.order_description) return res.status(400).json({ error: 'Missing metadata' });
                
                const metadata = JSON.parse(payload.order_description);
                if (!metadata.url) return res.status(400).json({ error: 'Missing URL in metadata' });

                newLink = { 
                    title: metadata.title.toUpperCase().substring(0, 25), 
                    url: metadata.url, 
                    root_domain: getRootDomain(metadata.url),
                    category: metadata.category,
                    payment_status: 'approved' // Matches SQL schema
                };
            } else { return res.status(200).json({ message: 'Ignored status' }); }
        } else { return res.status(400).json({ error: 'No signature found.' }); }

    } catch (err) {
        console.error('❌ [WEBHOOK ERROR]', err.message);
        return res.status(400).json({ error: err.message });
    }

    // --- SUPABASE INJECTION ---
    if (newLink && newLink.root_domain) {
        try {
            // Upsert handles the logic: if the frontend already made it 'pending', this upgrades it to 'approved'.
            // If the frontend failed or was bypassed, this injects the fresh 'approved' row.
            const { error } = await supabase.from('links_directory').upsert(newLink, { onConflict: 'root_domain' });
            if (error) throw error;
            return res.status(200).json({ success: true, message: 'Node successfully injected and approved.' });
        } catch (error) {
            console.error('❌ [DB INJECTION ERROR]', error);
            return res.status(500).json({ error: 'Database upsert failed.' });
        }
    }
}
