import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Secure backend initialization
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { title, url, category } = req.body;

    if (!title || !url || !category) {
      return res.status(400).json({ error: 'Missing required platform designation or protocol.' });
    }

    let rootDomain;
    try {
      rootDomain = new URL(url).hostname.replace('www.', '');
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL structure. Ensure it begins with https://' });
    }

    // Anti-Monopoly Check
    const { data: existing } = await supabase
      .from('links_directory')
      .select('id')
      .eq('root_domain', rootDomain)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'UPLINK REJECTED: Domain monopoly already established.' });
    }

    // Inject the pending node
    const { error: insertError } = await supabase
      .from('links_directory')
      .insert([{
        title: title.toUpperCase().substring(0, 25),
        url: url,
        root_domain: rootDomain,
        category: category,
        payment_status: 'pending'
      }]);

    if (insertError) {
      console.error('Insert Error:', insertError);
      return res.status(500).json({ error: 'Database injection failed.' });
    }

    // Teleport user to Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Olympus Multiverse Node: ${title}`,
            description: `Permanent directory injection for ${rootDomain}`,
          },
          unit_amount: 200, // Hardcoded $2.00 injection fee
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.origin}/?success=true`,
      cancel_url: `${req.headers.origin}/`,
      metadata: {
        root_domain: rootDomain,
        url: url,
        title: title,
        category: category
      }
    });

    return res.status(200).json({ url: session.url });

  } catch (error) {
    console.error('Checkout API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
