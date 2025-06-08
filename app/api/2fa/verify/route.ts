import { verify2FA } from "@/lib/2fa";
import { decrypt } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/utils/verifyToken";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import { checkRateLimit } from "@/lib/checkRateLimit";
import { authorizeSensitiveAction } from "@/utils/authorizeSensitiveAction";
import { randomBytes } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET!;

const schema = z.object({
  code: z.string().length(6),
  deviceId: z.string(),
  context: z.enum(["login", "sensitive"]),
  actionType: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const rateLimitCheck = await checkRateLimit(req);
    if (!rateLimitCheck.ok) {
      return rateLimitCheck.response;
    }

    const result = schema.parse(await req.json());
    const { code, deviceId, context, actionType } = result;

    if (context === "login") {
      const temp_token = req.cookies.get("temp_token")?.value;
      if (!temp_token)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const payload = await verifyToken(temp_token);
      if (!payload)
        return NextResponse.json({ error: "Invalid token" }, { status: 403 });
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || !user.twoFactorSecret)
        return NextResponse.json(
          { error: "2FA secret missing" },
          { status: 500 }
        );

      const secret = decrypt(user.twoFactorSecret);
      const valid = verify2FA(secret, code);

      if (!valid)
        return NextResponse.json({ error: "Invalid code" }, { status: 403 });

      if (!user?.twoFactorEnabled)
        await prisma.user.update({
          where: { id: user.id },
          data: { twoFactorEnabled: true },
        });

      await prisma.twoFAChallenge.create({
        data: {
          userId: user.id,
          context,
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

    if (context === "sensitive") {
      const token = req.cookies.get("token")?.value;
      if (!token)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const payload = await verifyToken(token);
      if (!payload)
        return NextResponse.json({ error: "Invalid token" }, { status: 403 });

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || !user.twoFactorSecret)
        return NextResponse.json(
          { error: "2FA secret missing" },
          { status: 500 }
        );

      const isAlreadyAuthorized = await authorizeSensitiveAction(
        user.id,
        actionType,
        context,
        deviceId
      );

      if (isAlreadyAuthorized === true) {
        await prisma.twoFAChallenge.updateMany({
          where: {
            userId: user.id,
            context,
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
      }
      const secret = decrypt(user.twoFactorSecret);
      const valid = verify2FA(secret, code);

      if (!valid) {
        return NextResponse.json({ error: "Invalid code" }, { status: 403 });
      }

      await prisma.twoFAChallenge.create({
        data: {
          userId: user.id,
          context,
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
  } catch (error) {
    console.error("Error in 2FA verification:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
