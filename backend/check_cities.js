import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    await mongoose.connect(process.env.MONGODB_URL);
    // Find a city that has shops
    const shops = await mongoose.connection.collection('shops').find().toArray();
    console.log("Cities with shops:", [...new Set(shops.map(s => s.city))]);

    // Let's take the first city
    const city = shops[0].city;
    const cityShops = shops.filter(s => s.city === city);
    console.log(`Shops in ${city}:`, cityShops.length);
    console.log('Categories of first shop in this city:', cityShops[0].categories);

    process.exit(0);
}
run();
