import Redis from "ioredis";
import dotenv from "dotenv"
dotenv.config()

const redis = new Redis(process.env.REDIS_URL, {
  tls: {
    rejectUnauthorized: false
  },
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

redis.on("connect", () => {
    console.log("Redis connected to Upstash");
});

redis.on("error", (err) => {
    console.log("Redis connection error", err);
});

export default redis;
