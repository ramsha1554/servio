import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

console.log("Node version:", process.version);
console.log("Platform:", process.platform);

async function testConnection() {
    try {
        console.log("Connecting to:", process.env.MONGODB_URL);
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connection SUCCESSFUL");
    } catch (err) {
        console.log("Connection FAILED:", err.message);
        console.dir(err, { depth: null });
    }
    process.exit(0);
}

testConnection();
