import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Reuse redis connection
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(5, "1 m"), // 5 requests per minute
  analytics: true,
});
