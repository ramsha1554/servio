
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.model.js";
import bcryptjs from "bcryptjs";

dotenv.config({ path: "./backend/.env" });

const seedDelivery = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to MongoDB for Delivery Seeding");

        const email = "delivery.test@servio.com";
        const password = await bcryptjs.hash("password123", 10);
        const AURANGABAD_COORDS = [75.3433139, 19.8761653];

        let user = await User.findOne({ email });
        if (user) {
            console.log("Delivery Boy already exists. Updating/Resetting...");
            user.password = password;
            user.role = "deliveryBoy";
            user.location = { type: 'Point', coordinates: AURANGABAD_COORDS };
            await user.save();
        } else {
            user = await User.create({
                fullName: "Test Delivery Boy",
                email,
                password,
                mobile: "9999999999",
                role: "deliveryBoy",
                isOtpVerified: true,
                location: { type: 'Point', coordinates: AURANGABAD_COORDS }
            });
            console.log("Created Delivery Boy:", email);
        }

        console.log("Done.");
        process.exit(0);

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedDelivery();
