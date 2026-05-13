import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { runSeederEngine } from './core/engine.js';

dotenv.config();

const parseArgs = () => {
    const args = process.argv.slice(2);
    
    const getArgValue = (name) => {
        const index = args.indexOf(name);
        if (index !== -1 && args[index + 1] && !args[index + 1].startsWith('--')) {
            return args[index + 1];
        }
        const kv = args.find(a => a.startsWith(`${name}=`));
        return kv ? kv.split('=')[1] : null;
    };

    return {
        dryRun: args.includes('--dry-run'),
        reset: args.includes('--reset'),
        force: args.includes('--force'),
        verbose: args.includes('--verbose'),
        limit: parseInt(getArgValue('--limit')) || null,
        exportCredentials: !args.includes('--export-credentials=false')
    };
};

const validateEnv = () => {
    const required = ['MONGODB_URL', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing environment variables: ${missing.join(', ')}`);
    }
};

const main = async () => {
    const options = parseArgs();

    console.log("========================================");
    console.log("🚀 SERVIO PRODUCTION SEEDER STARTING");
    console.log("========================================");
    
    try {
        validateEnv();
        console.log("📡 Mode: " + (options.dryRun ? "DRY RUN" : "LIVE"));
        console.log("📡 Reset: " + (options.reset ? "YES" : "NO"));
        console.log("📡 Verbose: " + (options.verbose ? "YES" : "NO"));
        console.log("========================================\n");

        await mongoose.connect(process.env.MONGODB_URL, {
            tls: true,
            tlsAllowInvalidCertificates: true // Bypasses local CA issues without compromising Atlas auth
        });
        
        const results = await runSeederEngine(options);

        console.log("\n========================================");
        console.log("✅ SEEDING COMPLETE");
        console.log(`Total Restaurants Processed: ${results.totalSeeded}`);
        console.log(`Duplicates Prevented: ${results.duplicatesPrevented}`);
        console.log("========================================");
        
        process.exit(0);
    } catch (error) {
        console.error("\nFATAL ERROR DURING SEEDING:");
        console.error(error.message);
        process.exit(1);
    }
};

main();
