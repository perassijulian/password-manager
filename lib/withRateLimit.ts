import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "./checkRateLimit";

export async function withRateLimit(
  req: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const rateLimitCheck = await checkRateLimit(req);
  if (!rateLimitCheck.ok) {
    return rateLimitCheck.response;
  }
  return handler();
}
