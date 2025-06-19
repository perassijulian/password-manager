import { verifyUserToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeSensitiveAction } from "@/lib/security/authorizeSensitiveAction";
import { decrypt } from "@/lib/crypto";
import { verify2FA } from "@/lib/2fa";
import { ActionType } from "@/types";

export async function handleSensitive2FA(
  req: NextRequest,
  {
    code,
    deviceId,
    actionType,
  }: { code: string; deviceId: string; actionType: ActionType }
) {
  // 1. Auth token
  const payload = await verifyUserToken(req);
  if (payload instanceof NextResponse) return payload;

  // 2. Find user
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  // 3. Check if user already set 2FA secret
  if (!user || !user.twoFactorSecret)
    return NextResponse.json({ error: "2FA secret missing" }, { status: 500 });

  // 4. Check if user did challenge not long time ago
  const isAlreadyAuthorized = await authorizeSensitiveAction(
    user.id,
    actionType,
    "sensitive",
    deviceId
  );

  // 5. If auth not long time ago, update challenge time
  // and return with success: true
  if (isAlreadyAuthorized === true) {
    await prisma.twoFAChallenge.updateMany({
      where: {
        userId: user.id,
        context: "sensitive",
        deviceId,
        actionType,
        method: "TOTP",
        isVerified: true,
      },
      data: {
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        verifiedAt: new Date(),
      },
    });
    return NextResponse.json({ success: true });
  } else {
    // 6. If not already auth, verify code
    const secret = decrypt(user.twoFactorSecret);
    const valid = verify2FA(secret, code);

    if (!valid) {
      return NextResponse.json({ error: "Invalid code" }, { status: 403 });
    }

    // 7. Create twoFAChallenge and return with success: true
    await prisma.twoFAChallenge.create({
      data: {
        userId: user.id,
        context: "sensitive",
        deviceId,
        actionType,
        method: "TOTP",
        isVerified: true,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        verifiedAt: new Date(),
        ipAddress: req.headers.get("x-forwarded-for") || "Unknown",
        userAgent: req.headers.get("user-agent") || "Unknown",
      },
    });

    return NextResponse.json({ success: true });
  }
}
