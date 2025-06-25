import { sharedLimiter } from "./sharedLimiter";
import { getClientIp } from "@/utils/getClientIp";
import { NextRequest, NextResponse } from "next/server";
import { checkLoginAttempt } from "./loginAttemptLimiter";
import { RateLimitError } from "../errors/RateLimitError";

export async function checkRateLimit(req: NextRequest, email?: string) {
  // 1. Get client ip and double check we got it
  const ip = getClientIp(req);
  if (!ip) throw new RateLimitError("IP not found", 400);

  // 2. Rate limit by ip
  const { success } = await sharedLimiter.limit(ip);
  if (!success) {
    throw new RateLimitError("Too many requests. Please try again later", 429);
  }

  // 3. Rate limit by email (we got it from /api/login) to avoid brute-force
  if (email) {
    await checkLoginAttempt(email, req);
  }

  return { success: true };
}
