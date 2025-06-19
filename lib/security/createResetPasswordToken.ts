import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { NextResponse } from "next/server";

const cuidSchema = z.object({
  userId: z.string().cuid(),
});

export default async function createResetPasswordToken(userId: string) {
  try {
    const rawParams = cuidSchema.safeParse({ userId });
    if (!rawParams.success) return { ok: false };

    const { userId: validUserId } = rawParams.data;

    const token = randomBytes(32).toString("hex");
    const hashedToken = createHash("sha256").update(token).digest("hex");

    await prisma.passwordResetToken.deleteMany({
      where: { userId: validUserId },
    });

    const res = await prisma.passwordResetToken.create({
      data: {
        userId: validUserId,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 30), // 30 min expiry
      },
    });

    if (!res) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Server error", status: 500 }),
      };
    } else {
      return { ok: true, token };
    }
  } catch (error) {
    console.error("Error when creating reset password token: ", error);
    return {
      ok: false,
      response: NextResponse.json({ error: "Server error", status: 500 }),
    };
  }
}
