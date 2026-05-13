import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Shop from '../../../models/shop.model.js';
import Item from '../../../models/item.model.js';
import User from '../../../models/user.model.js';

dotenv.config();

const inspect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            tls: true,
            tlsAllowInvalidCertificates: true
        });
        console.log("Connected to Atlas for inspection...\n");

        const sampleShop = await Shop.findOne().populate('owner items').lean();
        const sampleItem = await Item.findOne().populate('shop').lean();
        const sampleOwner = await User.findOne({ role: 'owner' }).lean();

        const report = {
            shopStructure: sampleShop,
            itemStructure: sampleItem,
            ownerStructure: sampleOwner,
            metadata: {
                shopCuisinesFound: sampleShop?.categories || [],
                itemCategoryFound: sampleItem?.category || "",
                geoJsonType: sampleShop?.location?.type || "",
                cloudinaryPattern: sampleShop?.image?.includes('res.cloudinary.com') ? "Cloudinary Standard" : "Other"
            }
        };

        console.log("=== PRODUCTION DATA AUDIT REPORT ===");
        console.log(JSON.stringify(report, null, 2));
        process.exit(0);
    } catch (error) {
        console.error("Inspection failed:", error.message);
        process.exit(1);
    }
};

inspect();
