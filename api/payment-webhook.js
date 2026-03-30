export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const payload = req.body;
    let newLink = {};

    // 1. EXTRACT DATA FROM STRIPE OR NOWPAYMENTS
    if (payload.type === 'checkout.session.completed') {
        // Stripe Parsing Logic
        const session = payload.data.object;
        const fields = session.custom_fields || [];
        
        const siteName = fields.find(f => f.label.custom === 'Platform Name')?.text?.value || "Olympus Contributor";
        const siteUrl = fields.find(f => f.label.custom === 'Target URL')?.text?.value;

        if (!siteUrl) return res.status(400).json({ error: 'Missing Target URL in payload' });
        
        // Defaulting to 'featured' unless you pass a category dynamically later
        newLink = { n: siteName, u: siteUrl, cat: "featured" }; 
        
    } else if (payload.payment_status === 'finished') {
        // NOWPayments Parsing Logic
        if (!payload.order_description) return res.status(400).json({ error: 'Missing URL description' });
        newLink = { n: payload.order_id || "Olympus Contributor", u: payload.order_description, cat: "featured" };
        
    } else {
        return res.status(200).json({ message: 'Ignored non-success event' });
    }

    // 2. CONNECT TO GITHUB TO PUSH DATA
    const GITHUB_TOKEN = process.env.GITHUB_PAT; 
    const OWNER = 'highland88999-commits'; 
    const REPO = 'your-repo-name'; // --> UPDATE THIS WITH YOUR EXACT REPO NAME
    const PATH = 'api/queue.json';

    try {
        const getFile = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`, {
            headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` }
        });
        
        const fileData = await getFile.json();
        let currentQueue = [];
        let sha = fileData.sha;

        if (fileData.content) {
            const decodedStr = Buffer.from(fileData.content, 'base64').toString('utf-8');
            currentQueue = JSON.parse(decodedStr);
        }

        currentQueue.push(newLink);
        const updatedContent = Buffer.from(JSON.stringify(currentQueue, null, 2)).toString('base64');

        const updateRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Auto-Deploy: Automated Territory Claim - ${newLink.n}`,
                content: updatedContent,
                sha: sha 
            })
        });

        if (!updateRes.ok) throw new Error('GitHub push failed');

        return res.status(200).json({ success: true, message: 'Link queued for next Artemis sync.' });

    } catch (error) {
        console.error('❌ [SYSTEM ERROR]', error);
        return res.status(500).json({ error: 'Failed to update GitHub queue' });
    }
}
