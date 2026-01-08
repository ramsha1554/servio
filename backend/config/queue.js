import { Queue } from "bullmq";
import dotenv from "dotenv";

dotenv.config();

// Create a new queue named 'email-queue'
// We can pass Redis connection settings directly
export const emailQueue = new Queue("email-queue", {
    connection: process.env.REDIS_URL ? {
        url: process.env.REDIS_URL
    } : {
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined
    }
});
