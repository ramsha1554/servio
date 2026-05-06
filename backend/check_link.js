
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.model.js";
import Shop from "./models/shop.model.js";

dotenv.config({ path: "./backend/.env" });

const checkLink = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to MongoDB for Check");

        const owners = await User.find({ role: "owner" });
        console.log(`Found ${owners.length} Owners.`);

        for (const owner of owners) {
            const shop = await Shop.findOne({ owner: owner._id });
            if (shop) {
                console.log(`[OK] Owner: ${owner.email} (${owner._id}) -> Shop: ${shop.name} (${shop._id})`);
            } else {
                console.log(`[FAIL] Owner: ${owner.email} (${owner._id}) -> NO SHOP LINKED`);
            }
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkLink();
