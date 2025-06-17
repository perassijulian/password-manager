import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "./checkRateLimit";
import { getClientIp } from "@/utils/getClientIp";

export async function withRateLimit(
  req: NextRequest,
  handler: () => Promise<NextResponse>,
  type: "ip" | "email+ip" = "ip",
  email?: string
): Promise<NextResponse> {
  const ip = getClientIp(req);
  let key = ip;
  if (type === "email+ip") {
    key = `${email}_${ip}`;
  }
  const rateLimitCheck = await checkRateLimit(key);
  if (!rateLimitCheck.ok) {
    return rateLimitCheck.response;
  }
  return handler();
}
