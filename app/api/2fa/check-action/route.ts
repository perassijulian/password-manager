import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/utils/verifyToken";
import { z } from "zod";

const RequestSchema = z.object({
  actionType: z.string().min(1),
  context: z.string().optional(),
  deviceId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload?.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { actionType, context, deviceId } = parsed.data;
    const now = new Date();
    const FIVE_MINUTES = 5 * 60 * 1000;

    const ipAddress = req.headers.get("x-forwarded-for") ?? null;
    const userAgent = req.headers.get("user-agent") ?? null;

    const recentChallenge = await prisma.twoFAChallenge.findFirst({
      where: {
        userId: payload.userId,
        actionType,
        isVerified: true,
        expiresAt: {
          gt: now,
        },
        ...(context ? { context } : {}),
      },
      orderBy: {
        verifiedAt: "desc",
      },
    });

    if (!recentChallenge) {
      return NextResponse.json(
        { allowed: false, reason: "No matching verified 2FA challenge" },
        { status: 403 }
      );
    }

    // Verify recency
    const verifiedAt = recentChallenge.verifiedAt;
    if (
      !verifiedAt ||
      now.getTime() - new Date(verifiedAt).getTime() > FIVE_MINUTES
    ) {
      return NextResponse.json(
        { allowed: false, reason: "2FA challenge expired or too old" },
        { status: 403 }
      );
    }

    // Optional IP, user-agent, and deviceId match (can be strict or soft-fail)
    if (
      (recentChallenge.ipAddress &&
        ipAddress &&
        recentChallenge.ipAddress !== ipAddress) ||
      (recentChallenge.userAgent &&
        userAgent &&
        recentChallenge.userAgent !== userAgent) ||
      (recentChallenge.deviceId &&
        deviceId &&
        recentChallenge.deviceId !== deviceId)
    ) {
      return NextResponse.json(
        {
          allowed: false,
          reason: "Environment mismatch (IP, agent, or device)",
        },
        { status: 403 }
      );
    }

    // Optional: Invalidate after use (one-time)
    // await prisma.twoFAChallenge.update({
    //   where: { id: recentChallenge.id },
    //   data: { isVerified: false },
    // });

    return NextResponse.json({ allowed: true });
  } catch (err) {
    console.error("Error in /api/2fa/check-action:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
