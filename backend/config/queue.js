import { Queue } from "bullmq";
import dotenv from "dotenv";
import redis from "./redis.js";

dotenv.config();

export const emailQueue = new Queue("email-queue", {
    connection: redis
});
