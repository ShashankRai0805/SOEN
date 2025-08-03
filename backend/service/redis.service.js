import Redis from 'ioredis';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

console.log('Redis config:', {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD ? '***hidden***' : 'not set'
});

// Check if Redis environment variables are properly set
if (!process.env.REDIS_HOST || !process.env.REDIS_PORT || !process.env.REDIS_PASSWORD) {
    console.error('Redis environment variables not properly set!');
    console.log('REDIS_HOST:', process.env.REDIS_HOST);
    console.log('REDIS_PORT:', process.env.REDIS_PORT);
    console.log('REDIS_PASSWORD:', process.env.REDIS_PASSWORD ? 'set' : 'not set');
}

const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'redis-19375.crce182.ap-south-1-1.ec2.redns.redis-cloud.com',
    port: parseInt(process.env.REDIS_PORT) || 19375,
    password: process.env.REDIS_PASSWORD || 'BcllQuQ8nnVhUKkZlYZFQP4U39W4EUUE',
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.on('error', (error) => {
    console.error('Redis connection error:', error.message);
});

export default redisClient;