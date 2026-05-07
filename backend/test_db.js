import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Order from './models/order.model.js';
import DeliveryAssignment from './models/deliveryAssignment.model.js';
import User from './models/user.model.js';

async function run() {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database connected.");

    console.log("--- db.orders.find({}).limit(3) ---");
    const orders = await Order.find({}).limit(3).lean();
    console.dir(orders, { depth: null });

    console.log("\n--- db.deliveryassignments.find({}).limit(3) ---");
    const assignments = await DeliveryAssignment.find({}).limit(3).lean();
    console.dir(assignments, { depth: null });

    console.log("\n--- db.users.find({role: 'deliveryBoy'}).limit(3) ---");
    const users = await User.find({ role: "deliveryBoy" }).limit(3).lean();
    console.dir(users, { depth: null });

    console.log("\n--- Indexes ---");
    console.log("Order indexes:", await Order.collection.getIndexes());
    console.log("DeliveryAssignment indexes:", await DeliveryAssignment.collection.getIndexes());
    console.log("User indexes:", await User.collection.getIndexes());

    process.exit(0);
}

run();
