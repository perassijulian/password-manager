import { sharedLimiter } from "./sharedLimiter";
import { getClientIp } from "@/utils/getClientIp";
import { NextRequest, NextResponse } from "next/server";
import { checkLoginAttempt } from "./loginAttemptLimiter";

type RateLimitResult = { ok: true } | { ok: false; response: NextResponse };

export async function checkRateLimit(
  req: NextRequest,
  email?: string
): Promise<RateLimitResult> {
  try {
    // 1. Get client ip and double check we got it
    const ip = getClientIp(req);
    if (!ip)
      return {
        ok: false,
        response: NextResponse.json({ error: "Ip not found" }, { status: 400 }),
      };

    // 2. Rate limit by ip
    const { success } = await sharedLimiter.limit(ip);
    if (!success) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Too many requests, please try again later." },
          { status: 429 }
        ),
      };
    }

    // 3. Rate limit by email (we got it from /api/login) to avoid brute-force
    if (email) {
      const loginLimit = await checkLoginAttempt(email, req);
      if (!loginLimit.ok) return loginLimit;
    }

    return { ok: true };
  } catch (error) {
    console.error("Error in rate limit check:", error);
    return {
      ok: false,
      response: NextResponse.json({ error: "Server error." }, { status: 500 }),
    };
  }
}
