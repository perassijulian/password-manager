import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rateLimit/withRateLimit";
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

      const record = await prisma.verificationToken.findUnique({
        where: { token },
      });

      if (!record || record.expiresAt < new Date()) {
        return NextResponse.json(
          { success: false, message: "Invalid or expired token" },
          { status: 400 }
        );
      }

      await prisma.user.update({
        where: { id: record.userId },
        data: { verifiedAt: new Date() },
      });

      await prisma.verificationToken.delete({ where: { token } });

      const redirectUrl = new URL("/login", process.env.APP_URL);
      return NextResponse.redirect(redirectUrl.toString());
    });
  } catch (error) {
    console.error("Error while verifying email token: ", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
