import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "./checkRateLimit";

// Wrapper to rate limit by id and/or email
export async function withRateLimit(
  req: NextRequest,
  handler: () => Promise<NextResponse>,
  email?: string
): Promise<NextResponse> {
  const rateLimitCheck = await checkRateLimit(req, email);
  if (!rateLimitCheck.ok) {
    return rateLimitCheck.response;
  }
  return handler();
}
