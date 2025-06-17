import { rateLimiter } from "@/lib/rateLimit/rateLimiter";
import { NextResponse } from "next/server";

type RateLimitResult = { ok: true } | { ok: false; response: NextResponse };

export async function checkRateLimit(key: string): Promise<RateLimitResult> {
  try {
    if (!key)
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Key not found" },
          { status: 400 }
        ),
      };

    const { success } = await rateLimiter.limit(key);
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
