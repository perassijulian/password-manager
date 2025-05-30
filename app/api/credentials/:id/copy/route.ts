import { verifyToken } from "@/utils/verifyToken";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { rateLimiter } from "@/lib/rateLimiter";
import { getClientIp } from "@/utils/getClientIp";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get("token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip = getClientIp(req);
  if (!ip)
    return NextResponse.json(
      { error: "IP address not found" },
      { status: 400 }
    );

  const { success } = await rateLimiter.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests, please try again later." },
      { status: 429 }
    );
  }

  const payload = await verifyToken(token);
  if (!payload)
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });

  const credential = await prisma.credential.findUnique({
    where: { id: params.id, userId: payload.userId },
  });

  if (!credential) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const fullPassword = decrypt(credential.password);

  return NextResponse.json({ password: fullPassword }, { status: 200 });
}
