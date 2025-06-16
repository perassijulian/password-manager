import { generate2FASecret, generateQRCode } from "@/lib/2fa";
import { encrypt } from "@/lib/crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rateLimit/withRateLimit";
import { verifyTempToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting
    return withRateLimit(req, async () => {
      // 2. Auth token
      const payload = await verifyTempToken(req);
      if (payload instanceof NextResponse) return payload;

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
    });
  } catch (error) {
    console.error("Error in 2FA setup:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
