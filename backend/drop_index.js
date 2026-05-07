import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Order from './models/order.model.js';

async function run() {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database connected.");
    
    try {
        await Order.collection.dropIndex("location.coordinates_2dsphere");
        console.log("Dropped index location.coordinates_2dsphere");
    } catch(err) {
        console.log("Error dropping index (may not exist):", err.message);
    }

    // Wait a bit for Mongoose to auto-create the new one since order.model.js is imported
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const indexes = await Order.collection.getIndexes();
    console.log("Current Order Indexes:");
    console.dir(indexes, { depth: null });
    
    process.exit(0);
}

run();
