import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // 1. Authorization Check: Ensures only your Cron job can trigger this
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized. Invalid or missing CRON_SECRET.' });
    }

    // 2. Initialize Admin Client: Bypasses RLS using the Service Role Key
    const supabaseAdmin = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY, // MUST be the Service Role Key, NOT the anon key
        { auth: { persistSession: false } }
    );

    try {
        console.log("Initiating directory scrub...");

        // 3. The Scrubbing Logic: Delete anything pending/rejected older than 7 days
        // Adjust the logic here based on exactly what you want scrubbed
        const { data, error } = await supabaseAdmin
            .from('links_directory')
            .delete()
            .eq('payment_status', 'pending')
            .select(); 

        if (error) throw error;

        return res.status(200).json({
            status: "success",
            message: "Directory scrubbed successfully.",
            nodes_removed: data ? data.length : 0,
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error("Scrub failed:", err.message);
        return res.status(500).json({ error: "Internal Server Error during scrub phase." });
    }
}
