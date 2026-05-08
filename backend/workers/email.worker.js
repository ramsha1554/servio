import { Worker } from "bullmq";
import { sendOtpMail, sendDeliveryOtpMail } from "../utils/mail.js";
import redis from "../config/redis.js";
import logger from "../config/logger.js";

const emailWorker = new Worker("email-queue", async (job) => {
    logger.info(`Processing Job: ${job.name}`);

    try {
        if (job.name === "send-otp") {
            const { email, otp } = job.data;
            await sendOtpMail(email, otp);
            logger.info(`OTP Email sent to ${email}`);
        } else if (job.name === "send-delivery-otp") {
            const { user, otp } = job.data;
            await sendDeliveryOtpMail(user, otp);
            logger.info(`Delivery OTP Email sent to ${user.email}`);
        }
    } catch (error) {
        logger.error(`Failed to send email for job ${job.name}`, { error: error.message });
        throw error; // Let BullMQ handle retries
    }
}, {
    connection: redis
});

// Basic event listeners
emailWorker.on("completed", (job) => {
    logger.info(`Job ${job.id} completed!`);
});

emailWorker.on("failed", (job, err) => {
    logger.error(`Job ${job.id} failed`, { error: err.message });
});

export default emailWorker;
