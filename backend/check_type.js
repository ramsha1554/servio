import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    await mongoose.connect(process.env.MONGODB_URL);
    const shops = await mongoose.connection.collection('shops').find({categories: {$exists: true}}).limit(3).toArray();
    shops.forEach(s => {
        console.log('Shop categories:', JSON.stringify(s.categories));
    });
    process.exit(0);
}
run();
