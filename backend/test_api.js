import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import axios from 'axios';
dotenv.config();

import User from './models/user.model.js';

async function run() {
    await mongoose.connect(process.env.MONGODB_URL);
    const dbUser = await User.findOne({ role: "deliveryBoy" });
    console.log("Using user:", dbUser.email, dbUser._id);
    const token = jwt.sign({ userId: dbUser._id }, process.env.JWT_SECRET);
    
    try {
        const res = await axios.get('http://localhost:8000/api/order/get-assignments', {
            headers: {
                Cookie: `token=${token}`
            }
        });
        console.log("Success:", res.data);
    } catch (err) {
        console.log("Error status:", err.response?.status);
        console.log("Error data:", err.response?.data);
    }
    process.exit(0);
}
run();
