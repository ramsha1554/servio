import { Worker } from "bullmq";
import { sendOtpMail, sendDeliveryOtpMail } from "../utils/mail.js";

const emailWorker = new Worker("email-queue", async (job) => {
    console.log(`Processing Job: ${job.name}`);

    try {
        if (job.name === "send-otp") {
            const { email, otp } = job.data;
            await sendOtpMail(email, otp);
            console.log(`OTP Email sent to ${email}`);
        } else if (job.name === "send-delivery-otp") {
            const { user, otp } = job.data;
            await sendDeliveryOtpMail(user, otp);
            console.log(`Delivery OTP Email sent to ${user.email}`);
        }
    } catch (error) {
        console.error(`Failed to send email for job ${job.name}:`, error);
        throw error; // Let BullMQ handle retries
    }
}, {
    connection: {
        host: "localhost",
        port: 6379
    }
});

// Basic event listeners
emailWorker.on("completed", (job) => {
    console.log(`Job ${job.id} completed!`);
});

emailWorker.on("failed", (job, err) => {
    console.log(`Job ${job.id} failed with ${err.message}`);
});

export default emailWorker;
