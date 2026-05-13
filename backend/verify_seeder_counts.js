import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Shop from './models/shop.model.js';
import Item from './models/item.model.js';

dotenv.config();

const verify = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URL, {
            tls: true,
            tlsAllowInvalidCertificates: true
        });
        console.log("Connected successfully.\n");

        // Use the query logic requested by the user
        const cityCount = await Shop.countDocuments({ city: "Chhatrapati Sambhajinagar" });
        const totalItems = await Item.countDocuments({});

        console.log("========================================");
        console.log("🔍 SEEDING VERIFICATION RESULTS");
        console.log("========================================");
        console.log(`Shops in Chhatrapati Sambhajinagar: ${cityCount}`);
        console.log(`Total Items in Database:           ${totalItems}`);
        console.log("========================================\n");

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Verification failed:");
        console.error(error);
        process.exit(1);
    }
};

verify();
