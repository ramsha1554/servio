
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.model.js";
import Shop from "./models/shop.model.js";

dotenv.config({ path: "./backend/.env" });

const checkGreenleaf = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to MongoDB");

        const email = "owner.greenleaf@servio.com";
        const users = await User.find({ email });
        console.log(`Found ${users.length} User(s) with email ${email}`);

        users.forEach(u => {
            console.log(` - UserID: ...${u._id.toString().slice(-6)} | Role: ${u.role}`);
        });

        if (users.length === 0) process.exit(1);

        const targetUser = users[0];
        console.log(`Checking Shop for User ...${targetUser._id.toString().slice(-6)}`);

        const shop = await Shop.findOne({ owner: targetUser._id });

        if (shop) {
            console.log(`FOUND Shop: ${shop.name}`);
            console.log(` - ShopID: ...${shop._id.toString().slice(-6)}`);
            console.log(` - OwnerField: ...${shop.owner.toString().slice(-6)}`);
        } else {
            console.log("NO SHOP FOUND for this user.");
            // Check if ANY shop has this email's other users?
        }

        process.exit(0);

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkGreenleaf();
