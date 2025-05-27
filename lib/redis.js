import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// Initialize Redis client
export const redis = new Redis(process.env.UPSTASH_REDIS_URL);

(async () => {
    try {
        // Set key-value pair in Redis
        await redis.set('foo', 'bar');
        console.log('Key-value pair set successfully!');
    } catch (error) {
        console.error('Error setting key-value pair:', error);
    }
})();






















// import Redis from "ioredis"
// import dotenv from "dotenv";

// dotenv.config();

// export const redis = new Redis(process.env.UPSTASH_REDIS_URL);

// //key-value store
// await redis.set('foo', 'bar');