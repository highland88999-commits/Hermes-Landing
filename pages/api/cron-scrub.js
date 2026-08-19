import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // 1. Verify Vercel Cron Authentication
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized CRON execution request.' });
  }

  try {
    // 2. Calculate the threshold (e.g., 24 hours ago)
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    // 3. Scrub pending nodes older than 24 hours
    const { data, error } = await supabase
      .from('links_directory')
      .delete()
      .eq('payment_status', 'pending')
      .lt('created_at', yesterday.toISOString());

    if (error) {
      console.error('CRON Scrubbing Error:', error);
      return res.status(500).json({ error: 'Failed to purge pending nodes.' });
    }

    console.log('✅ [CRON SCRUB] Successfully purged orphaned pending nodes.');
    return res.status(200).json({ success: true, message: 'Multiverse registry scrubbed successfully.' });

  } catch (err) {
    console.error('CRON Server Error:', err);
    return res.status(500).json({ error: 'Internal server error during scrubbing.' });
  }
}
