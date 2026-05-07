import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    await mongoose.connect(process.env.MONGODB_URL);
    const shops = await mongoose.connection.collection('shops').find().toArray();

    const cityShops = shops.filter(s => s.city === 'Chhatrapati Sambhaji Nagar');
    const shopsWithCat = cityShops.filter(s => s.categories && s.categories.length > 0);
    console.log(`Shops with cat in city:`, shopsWithCat.length);
    if (shopsWithCat.length > 0) {
        console.log('Categories of first shop:', shopsWithCat[0].categories);
    }

    process.exit(0);
}
run();
