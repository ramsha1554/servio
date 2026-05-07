import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    await mongoose.connect(process.env.MONGODB_URL);
    const shops = await mongoose.connection.collection('shops').find().toArray();
    const allCats = shops.flatMap(s => s.categories || []);
    console.log("Distinct shop categories:", [...new Set(allCats)]);
    process.exit(0);
}
run();
