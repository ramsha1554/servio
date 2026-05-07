import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    await mongoose.connect(process.env.MONGODB_URL);
    const count = await mongoose.connection.collection('shops').countDocuments();
    const withCat = await mongoose.connection.collection('shops').countDocuments({categories: {$exists: true, $not: {$size: 0}}});
    console.log('Total shops:', count);
    console.log('Shops with categories:', withCat);
    
    // Also items
    const itemCount = await mongoose.connection.collection('items').countDocuments();
    const itemsWithCat = await mongoose.connection.collection('items').countDocuments({category: {$exists: true}});
    console.log('Total items:', itemCount);
    console.log('Items with category:', itemsWithCat);
    
    process.exit(0);
}
run();
