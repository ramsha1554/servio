import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Shop from '../../../models/shop.model.js';
import Item from '../../../models/item.model.js';
import User from '../../../models/user.model.js';
import axios from 'axios';

dotenv.config();

const runAudit = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            tls: true,
            tlsAllowInvalidCertificates: true
        });
        console.log("Starting Final Integrity Audit...\n");

        const shops = await Shop.find().populate('items owner');
        const items = await Item.find();
        
        let issues = [];
        let cloudinaryChecks = 0;

        console.log(`Checking ${shops.length} shops and ${items.length} items...`);

        for (const shop of shops) {
            // 1. Check Owner Reference
            if (!shop.owner) issues.push(`Shop [${shop.name}] has no valid owner reference.`);
            else if (shop.owner.role !== 'owner') issues.push(`Shop [${shop.name}] owner has incorrect role: ${shop.owner.role}`);

            // 2. Check Items Array
            if (!shop.items || shop.items.length === 0) issues.push(`Shop [${shop.name}] has an empty items array.`);
            
            // 3. Check GeoJSON
            if (shop.location.type !== 'Point' || !Array.isArray(shop.location.coordinates) || shop.location.coordinates.length !== 2) {
                issues.push(`Shop [${shop.name}] has invalid GeoJSON structure.`);
            }

            // 4. Sample Cloudinary Check (Checking 1 shop image to avoid rate limits)
            if (cloudinaryChecks < 1) {
                try {
                    await axios.head(shop.image);
                    cloudinaryChecks++;
                } catch (e) {
                    issues.push(`Cloudinary URL unreachable for Shop [${shop.name}]: ${shop.image}`);
                }
            }
        }

        for (const item of items) {
            // 5. Check Shop Reference
            const parentShop = shops.find(s => s._id.toString() === item.shop.toString());
            if (!parentShop) issues.push(`Item [${item.name}] points to a non-existent shop: ${item.shop}`);
        }

        if (issues.length === 0) {
            console.log("\n✅ INTEGRITY AUDIT PASSED: All references, structures, and Cloudinary links are valid.");
        } else {
            console.error("\n❌ INTEGRITY AUDIT FAILED:");
            issues.forEach(issue => console.error(`  - ${issue}`));
        }

        process.exit(issues.length === 0 ? 0 : 1);
    } catch (error) {
        console.error("Audit script failed:", error.message);
        process.exit(1);
    }
};

runAudit();
