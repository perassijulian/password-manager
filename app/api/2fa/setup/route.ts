import { generate2FASecret, generateQRCode } from "@/lib/2fa";
import { encrypt } from "@/lib/crypto";
import { verifyToken } from "@/utils/verifyToken";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/checkRateLimit";

export async function POST(req: NextRequest) {
  try {
    const rateLimitCheck = await checkRateLimit(req);
    if (!rateLimitCheck.ok) {
      return rateLimitCheck.response;
    }

    const token = req.cookies.get("temp_token")?.value;
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
        twoFactorEnabled: false, // Initially set to false until verified
      },
    });
    return NextResponse.json({ qrCode, otpauth }, { status: 200 });
  } catch (error) {
    console.error("Error in 2FA setup:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
