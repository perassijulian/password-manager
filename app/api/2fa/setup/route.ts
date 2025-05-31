import { generate2FASecret, generateQRCode } from "@/lib/2fa";
import { encrypt } from "@/lib/crypto";
import { verifyToken } from "@/utils/verifyToken";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/utils/getClientIp";
import { rateLimiter } from "@/lib/rateLimiter";

export async function POST(req: NextRequest) {
  try {
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

    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload)
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { secret, otpauth } = generate2FASecret(user.email);
    const qrCode = await generateQRCode(otpauth);

    const encryptedSecret = encrypt(secret);

    await prisma.user.update({
      where: { id: payload.userId },
      data: {
        twoFactorSecret: encryptedSecret,
        // TODO: verify that the user set up 2FA before enabling it
        twoFactorEnabled: true,
      },
    });
    return NextResponse.json({ qrCode });
  } catch (error) {
    console.error("Error in 2FA setup:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
