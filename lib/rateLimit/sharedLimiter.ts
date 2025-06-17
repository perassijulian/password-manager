import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redisClient";

export const sharedLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
  analytics: true,
});
