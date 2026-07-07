import Stripe from 'stripe';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// 1. INITIALIZE EXTERNAL CLIENTS (Case-sensitive environment variables)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// 2. PAYMENT GATEWAY SECRETS
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;

// CRITICAL: Disable Vercel's default body parser. 
// Cryptography requires the raw, unparsed byte stream to verify signatures.
export const config = {
    api: { bodyParser: false }
};

// Helper function to extract the raw stream
async function getRawBody(req) {
    const chunks = [];
    for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

export default async function handler(req, res) {
    // Only accept POST requests
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const rawBody = await getRawBody(req);
    
    // Extract incoming signatures from the request headers (Headers are typically lowercase in Node.js)
    const stripeSig = req.headers['stripe-signature'];
    const nowpaymentsSig = req.headers['x-nowpayments-sig'];

    let newLink = null;

    try {
        // ==========================================
        // 3. STRIPE VERIFICATION BLOCK
        // ==========================================
        if (stripeSig) {
            // Stripe SDK mathematically verifies the raw payload against the secret
            const event = stripe.webhooks.constructEvent(rawBody, stripeSig, STRIPE_WEBHOOK_SECRET);
            
            if (event.type === 'checkout.session.completed') {
                const session = event.data.object;
                const metadata = session.metadata || {};
                
                if (!metadata.full_url) return res.status(400).json({ error: 'Missing Target URL in metadata' });
                
                newLink = { 
                    title: metadata.title || "OLYMPUS CONTRIBUTOR", 
                    full_url: metadata.full_url, 
                    root_domain: metadata.root_domain,
                    category_id: metadata.category_id || "featured",
                    payment_status: true 
                };
            } else {
                return res.status(200).json({ message: 'Ignored non-success Stripe event' });
            }
        } 
        
        // ==========================================
        // 4. NOWPAYMENTS VERIFICATION BLOCK
        // ==========================================
        else if (nowpaymentsSig) {
            // Parse payload and sort alphabetically per NOWPayments documentation
            const payload = JSON.parse(rawBody.toString('utf8'));
            const sortedParams = JSON.stringify(payload, Object.keys(payload).sort());
            
            // Hash the data and compare it to the provided signature
            const hmac = crypto.createHmac('sha512', NOWPAYMENTS_IPN_SECRET);
            hmac.update(sortedParams);
            const calculatedSig = hmac.digest('hex');

            if (calculatedSig !== nowpaymentsSig) {
                return res.status(401).json({ error: 'Invalid NOWPayments IPN signature' });
            }

            if (payload.payment_status === 'finished') {
                if (!payload.order_description) return res.status(400).json({ error: 'Missing URL description metadata' });
                
                // Assuming order_description contains a stringified JSON object
                const metadata = JSON.parse(payload.order_description);

                newLink = { 
                    title: metadata.title || "OLYMPUS CONTRIBUTOR", 
                    full_url: metadata.full_url, 
                    root_domain: metadata.root_domain,
                    category_id: metadata.category_id || "featured",
                    payment_status: true 
                };
            } else {
                return res.status(200).json({ message: `Ignored crypto status: ${payload.payment_status}` });
            }
        } 
        
        // ==========================================
        // 5. UNKNOWN SOURCE REJECTION
        // ==========================================
        else {
            return res.status(400).json({ error: 'Missing authentication signatures. Request rejected.' });
        }
    } catch (err) {
        console.error('❌ [WEBHOOK VERIFICATION ERROR]', err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // ==========================================
    // 6. SUPABASE INJECTION LOGIC
    // ==========================================
    if (newLink) {
        try {
            // Attempt to insert the link. If the root_domain already exists, 
            // the UNIQUE constraint in the database will block this and throw an error.
            const { error } = await supabase
                .from('links_directory')
                .insert([newLink]);

            if (error) throw error;

            return res.status(200).json({ success: true, message: 'Node permanently injected into Olympus.' });

        } catch (error) {
            console.error('❌ [SUPABASE INJECTION ERROR]', error);
            return res.status(500).json({ error: 'Failed to inject node. Potential domain conflict.' });
        }
    }
}
