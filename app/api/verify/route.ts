import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rateLimit/withRateLimit";
import argon2 from "argon2";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const paramsSchema = z.object({
  token: z
    .string()
    .length(64)
    .regex(/^[a-f0-9]+$/i),
});

export async function GET(req: NextRequest) {
  try {
    return withRateLimit(req, async () => {
      const rawInput = req.nextUrl.searchParams.get("token");
      const parsed = paramsSchema.safeParse({ token: rawInput });

      if (!parsed.success) {
        return NextResponse.json(
          { success: false, message: "Invalid or malformed token" },
          { status: 400 }
        );
      }
      const token = parsed.data.token;

      const potentialTokens = await prisma.verificationToken.findMany({
        where: {
          expiresAt: { gt: new Date() },
        },
      });

      let match: (typeof potentialTokens)[number] | null = null;

      for (const entry of potentialTokens) {
        const isMatch = await argon2.verify(entry.token, token);
        if (isMatch) {
          match = entry;
          break;
        }
      }

      if (!match) {
        return NextResponse.json(
          { success: false, message: "Invalid or expired token" },
          { status: 400 }
        );
      }

      await prisma.user.update({
        where: { id: match.userId },
        data: { verifiedAt: new Date() },
      });

      await prisma.verificationToken.delete({
        where: { id: match.id },
      });

      const redirectUrl = new URL("/login", process.env.APP_URL);
      return NextResponse.redirect(redirectUrl.toString());
    });
  } catch (error) {
    console.error("Error while verifying email token: ", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
