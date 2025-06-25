import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "./checkRateLimit";
import { RateLimitError } from "../errors/RateLimitError";

// Wrapper to rate limit by id and/or email
export async function withRateLimit(
  req: NextRequest,
  handler: () => Promise<NextResponse>,
  email?: string
): Promise<NextResponse> {
  try {
    await checkRateLimit(req, email);
    return await handler();
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("Unhandled error in withRateLimit:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
