"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitMiddleware = rateLimitMiddleware;
const redis_1 = require("@upstash/redis");
const redis = new redis_1.Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
const RATE_LIMIT_WINDOW_MS = 1 * 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;
function rateLimitMiddleware(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const clientIdentifier = req.ip; // Or use user ID, API key, etc.
        const redisKey = `rate_limit:${clientIdentifier}`;
        try {
            const requestCount = yield redis.incr(redisKey);
            if (requestCount === 1) {
                // First request in the window, set expiration
                yield redis.expire(redisKey, Math.floor(RATE_LIMIT_WINDOW_MS / 1000));
            }
            else if (requestCount > MAX_REQUESTS_PER_WINDOW) {
                // Rate limit exceeded
                const ttl = yield redis.ttl(redisKey); // Get remaining time
                res.setHeader('Retry-After', ttl); // Inform client when to retry
                res.status(429).send({
                    error: 'Too many requests',
                    message: `Rate limit exceeded. Please try again in ${ttl} seconds.`,
                });
                return;
            }
            // Request within limit, proceed
            next();
        }
        catch (error) {
            console.error("Redis rate limiting error:", error);
            res.status(500).send({ error: 'Internal server error' }); // Handle Redis errors
            return;
        }
    });
}
