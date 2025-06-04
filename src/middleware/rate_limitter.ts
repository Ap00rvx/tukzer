import { Request, Response,NextFunction } from 'express';
import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL as string,
    token: process.env.UPSTASH_REDIS_REST_TOKEN as string, 
});

const RATE_LIMIT_WINDOW_MS = 1 * 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; 
export async function rateLimitMiddleware(req:Request, res:Response , next:NextFunction) {
    const clientIdentifier = req.ip; // Or use user ID, API key, etc.

    const redisKey = `rate_limit:${clientIdentifier}`;

    try {
        const requestCount = await redis.incr(redisKey);

        if (requestCount === 1) {
            // First request in the window, set expiration
            await redis.expire(redisKey, Math.floor(RATE_LIMIT_WINDOW_MS / 1000));
        } else if (requestCount > MAX_REQUESTS_PER_WINDOW) {
            // Rate limit exceeded
            const ttl = await redis.ttl(redisKey); // Get remaining time
            res.setHeader('Retry-After', ttl); // Inform client when to retry
             res.status(429).send({
                error: 'Too many requests',
                message: `Rate limit exceeded. Please try again in ${ttl} seconds.`,
            });
            return ; 
        }

        // Request within limit, proceed
        next();

    } catch (error) {
        console.error("Redis rate limiting error:", error);
         res.status(500).send({ error: 'Internal server error' }); // Handle Redis errors
         return; 
    }
}