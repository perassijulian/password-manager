import { verify2FA } from "@/lib/2fa";
import { decrypt } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/utils/verifyToken";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/utils/getClientIp";
import { rateLimiter } from "@/lib/rateLimiter";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET!;

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

    const temp_token = req.cookies.get("temp_token")?.value;
    if (!temp_token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(temp_token);
    if (!payload)
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });

    const body = await req.json();
    const schema = z.object({ code: z.string().length(6) });
    const { code } = schema.parse(body);

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

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const cookie = serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });

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
        serialize("temp_token", "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 0,
        }),
      ].join(", ")
    );
    return response;
  } catch (error) {
    console.error("Error in 2FA verification:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
