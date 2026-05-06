
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.model.js";
import Shop from "./models/shop.model.js";

dotenv.config({ path: "./backend/.env" });

const debugUserShop = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to MongoDB");

        const targetId = "696542b19f9781a2824f3ab9";

        console.log(`Checking User ID: ${targetId}`);
        // Use try-catch for ObjectId casting just in case
        let user;
        try {
            user = await User.findById(targetId);
        } catch (e) {
            console.log("Invalid ObjectId format?");
        }

        if (user) {
            console.log(`[FOUND] User: ${user.fullName} (${user.email}) Role: ${user.role}`);
        } else {
            console.log(`[NOT FOUND] User with ID ${targetId} does not exist.`);
        }

        console.log(`Checking Shop with owner: ${targetId}`);
        const shop = await Shop.findOne({ owner: targetId });

        if (shop) {
            console.log(`[FOUND] Shop: ${shop.name} (${shop._id}) City: ${shop.city}`);
        } else {
            console.log(`[NOT FOUND] No Shop found for owner ${targetId}`);

            // Debug: List all shops and their owners to see if there's a mismatch
            console.log("--- Listing all Shops and Owners ---");
            const allShops = await Shop.find({}).select("name owner");
            allShops.forEach(s => {
                console.log(`Shop: ${s.name} -> OwnerID: ${s.owner}`);
            });
        }

        process.exit(0);

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

debugUserShop();
