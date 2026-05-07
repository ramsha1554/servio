import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    await mongoose.connect(process.env.MONGODB_URL);
    const items = await mongoose.connection.collection('items').find().toArray();
    const itemCats = [...new Set(items.map(i => i.category))];
    console.log("Distinct item categories:");
    console.dir(itemCats);
    
    process.exit(0);
}
run();
