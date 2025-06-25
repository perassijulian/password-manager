import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/utils/getClientIp";
import { redis } from "./redisClient";
import { RateLimitError } from "../errors/RateLimitError";

export async function checkLoginAttempt(email: string, req: NextRequest) {
  // 1. Get client ip and double check we got it
  const ip = getClientIp(req);
  if (!ip) throw new RateLimitError("IP not found", 400);

  const key = `login:fail:${email}_${ip}`;
  const attempts = await redis.incr(key);

  if (attempts === 1) {
    await redis.expire(key, 60 * 5); // expire after 5 minutes
  }

  if (attempts > 3) {
    throw new RateLimitError(
      "Too many login attempts. Please try again later.",
      429
    );
  }

  return { ok: true }; // no lock
}

export async function resetLoginFailLimit(email: string, req: NextRequest) {
  const ip = getClientIp(req);
  const key = `login:fail:${email}_${ip}`;
  await redis.del(key);
}
