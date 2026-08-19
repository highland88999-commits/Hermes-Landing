import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Disable the default Next.js body parser to preserve the raw request stream
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to extract raw body buffer
async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const rawBody = await getRawBody(req);
  const stripeSig = req.headers['stripe-signature'];

  let event;

  try {
    // Verify the event originated from Stripe
    event = stripe.webhooks.constructEvent(rawBody, stripeSig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('❌ [WEBHOOK SIGNATURE ERROR]', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Intercept the successful payment event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const metadata = session.metadata;

    if (!metadata || !metadata.root_domain) {
      console.error('❌ [WEBHOOK ERROR] Missing necessary metadata payload');
      return res.status(400).json({ error: 'Missing metadata.' });
    }

    try {
      // Activate the node by flipping the payment status to 'approved'
      const { error } = await supabase
        .from('links_directory')
        .update({ payment_status: 'approved' })
        .eq('root_domain', metadata.root_domain);

      if (error) throw error;

      console.log(`✅ [NODE INJECTED] Successfully activated ${metadata.root_domain}`);
      return res.status(200).json({ success: true, message: 'Node activated.' });
    } catch (dbError) {
      console.error('❌ [DB INJECTION ERROR]', dbError);
      return res.status(500).json({ error: 'Database update failed.' });
    }
  }

  // Gracefully acknowledge any other webhook events (like session creation or expiry)
  res.status(200).json({ received: true });
}
