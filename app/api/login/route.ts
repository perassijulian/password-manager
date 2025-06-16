import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { serialize } from "cookie";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { withRateLimit } from "@/lib/rateLimit/withRateLimit";

const JWT_SECRET = process.env.JWT_SECRET!;
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting
    return withRateLimit(req, async () => {
      const body = await req.json();
      const { email, password } = loginSchema.parse(body);

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user || !(await argon2.verify(user.password, password))) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      const tempToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: "5m",
      });

      const cookie = serialize("temp_token", tempToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 5, // 5 minutes
      });

      const response = NextResponse.json({
        success: true,
        requires2FA: user.twoFactorEnabled,
      });
      response.headers.set("Set-Cookie", cookie);
      return response;
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
