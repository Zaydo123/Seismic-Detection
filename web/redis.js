import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config({
    path: "../.env"
}); // Load environment variables
console.log(process.env.REDIS_HOSTNAME);
console.log(process.env.REDIS_PORT);
console.log(process.env.REDIS_DB);

// Create Redis client with proper configuration
const redis_client = createClient({
    host: process.env.REDIS_HOSTNAME,
    port: process.env.REDIS_PORT,
    database : process.env.REDIS_DB
});


async function sendUpdateToAnalyzer(file_id) {
    await redis_client.connect();
    console.log('Connected to Redis.');
    redis_client.publish('intraservice', file_id.toString());
    console.log(`Published message with file_id: ${file_id}`);
    redis_client.quit();
}

export { sendUpdateToAnalyzer };