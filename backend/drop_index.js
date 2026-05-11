import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const dropIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const collection = mongoose.connection.collection('users');
        
        // Attempt to drop the likely problematic index
        try {
            await collection.dropIndex("location_2dsphere");
            console.log("Successfully dropped 'location_2dsphere' index.");
        } catch (e) {
            console.log("Index 'location_2dsphere' not found or already dropped.");
        }

        console.log("The index will be automatically recreated as a 'sparse' index on your next server start.");
        process.exit(0);
    } catch (error) {
        console.error("Error dropping index:", error);
        process.exit(1);
    }
};

dropIndex();
