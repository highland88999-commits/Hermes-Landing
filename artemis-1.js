const fs = require('fs');
const path = require('path');

async function processUserLinks() {
    const queuePath = path.join(process.cwd(), 'api', 'queue.json');
    const archivePath = path.join(process.cwd(), 'api', 'links-archive.json');

    let queue = [];
    let archive = {};

    // 1. Load the files
    if (fs.existsSync(queuePath)) {
        queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
    }
    if (fs.existsSync(archivePath)) {
        archive = JSON.parse(fs.readFileSync(archivePath, 'utf8'));
    }

    if (queue.length === 0) {
        console.log("📡 Artemis System Idling. No new links in queue.");
        return;
    }

    console.log(`Processing ${queue.length} incoming submissions...`);

    // 2. Process and Validate Data
    queue.forEach(submission => {
        const { n, u, cat } = submission;
        
        try {
            const formattedUrl = new URL(u).href; 
            const category = cat.toLowerCase().replace(/\s+/g, '-'); 
            
            if (!archive[category]) archive[category] = [];

            // Duplicate Prevention Mechanism
            const isDuplicate = archive[category].some(item => item.u === formattedUrl);
            
            if (!isDuplicate) {
                archive[category].push({
                    n: n.toUpperCase().substring(0, 30), // Enforce stylistic caps and max length
                    u: formattedUrl
                });
                console.log(`✅ [${category}] Successfully added: ${n}`);
            } else {
                console.log(`⚠️ Skipping Duplicate: ${n} already exists in ${category}`);
            }
        } catch (e) {
            console.error(`❌ Invalid Submission skipped: ${n} - ${u}`);
        }
    });

    // 3. Bake and Clear Queue
    const dirPath = path.resolve(process.cwd(), 'api');
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

    fs.writeFileSync(archivePath, JSON.stringify(archive, null, 2));
    fs.writeFileSync(queuePath, JSON.stringify([], null, 2)); 
    
    console.log("🏆 Sync Complete. Archive updated.");
}

processUserLinks();
