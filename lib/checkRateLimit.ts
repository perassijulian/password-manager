import { getClientIp } from "@/utils/getClientIp";
import { rateLimiter } from "@/lib/rateLimiter";
import { NextRequest, NextResponse } from "next/server";

type RateLimitResult = { ok: true } | { ok: false; response: NextResponse };

export async function checkRateLimit(
  req: NextRequest
): Promise<RateLimitResult> {
  try {
    const ip = getClientIp(req);
    if (!ip)
      return {
        ok: false,
        response: NextResponse.json(
          { error: "IP address not found" },
          { status: 400 }
        ),
      };

    const { success } = await rateLimiter.limit(ip);
    if (!success) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Too many requests, please try again later." },
          { status: 429 }
        ),
      };
    }
    return { ok: true };
  } catch (error) {
    console.error("Error in rate limit check:", error);
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Internal Server Error when rate limit check." },
        { status: 500 }
      ),
    };
  }
}
