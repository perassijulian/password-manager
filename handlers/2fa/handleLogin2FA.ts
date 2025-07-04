import { verifyTempToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { verify2FA } from "@/lib/2fa";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import { ActionType } from "@/types";
import { randomBytes } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function handleLogin2FA(
  req: NextRequest,
  {
    code,
    deviceId,
    actionType,
  }: { code: string; deviceId: string; actionType: ActionType }
) {
  // 1. Auth token
  const payload = await verifyTempToken(req);
  if (payload instanceof NextResponse) return payload;

  // 2. Find user
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  // 3. Check if user already set 2FA secret and verify it
  if (!user || !user.twoFactorSecret)
    return NextResponse.json({ error: "2FA secret missing" }, { status: 500 });

  const secret = decrypt(user.twoFactorSecret);
  const valid = verify2FA(secret, code);

  if (!valid)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  if (!user?.twoFactorEnabled)
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: true },
    });

  // 4. Log user into twoFAChallange
  await prisma.twoFAChallenge.create({
    data: {
      userId: user.id,
      context: "login",
      deviceId,
      actionType,
      method: "TOTP",
      isVerified: true,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      verifiedAt: new Date(),
      ipAddress: req.headers.get("x-forwarded-for") || "Unknown",
      userAgent: req.headers.get("user-agent") || "Unknown",
    },
  });

  // 5. Sign token and set to cookies
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: "1h",
  });

  const csrfToken = randomBytes(32).toString("hex");

  const response = NextResponse.json({ success: true });
  response.headers.set(
    "Set-Cookie",
    [
      serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60, // 1 hour
      }),
      serialize("csrf_token", csrfToken, {
        httpOnly: false, // frontend needs to read it
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60,
      }),
      serialize("temp_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
      }),
    ].join(", ")
  );
  return response;
}
