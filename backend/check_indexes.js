import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Order from './models/order.model.js';
import User from './models/user.model.js';
import Shop from './models/shop.model.js';

async function run() {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database connected.");
    
    // Wait for Mongoose to ensure indexes
    await new Promise(r => setTimeout(r, 2000));

    console.log("=== Users Indexes ===");
    console.dir(await User.collection.getIndexes(), { depth: null });

    console.log("=== Shops Indexes ===");
    console.dir(await Shop.collection.getIndexes(), { depth: null });

    console.log("=== Orders Indexes ===");
    console.dir(await Order.collection.getIndexes(), { depth: null });
    
    process.exit(0);
}

run();
