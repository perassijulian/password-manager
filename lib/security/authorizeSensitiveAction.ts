import { prisma } from "@/lib/prisma";
import { ActionType, ContextType } from "@/types";
import { NextResponse } from "next/server";

export async function authorizeSensitiveAction(
  userId: string,
  actionType: ActionType,
  context: ContextType,
  deviceId: string
): Promise<true | NextResponse> {
  const challenge = await prisma.twoFAChallenge.findFirst({
    where: {
      userId,
      actionType,
      context,
      deviceId,
      verifiedAt: { not: null },
      expiresAt: { gt: new Date() },
    },
    orderBy: { verifiedAt: "desc" },
  });

  const maxAgeMs = 5 * 60 * 1000; // 5 minutes
  if (
    !challenge ||
    !challenge.verifiedAt ||
    Date.now() - new Date(challenge.verifiedAt).getTime() > maxAgeMs
  ) {
    return NextResponse.json({ error: "2FA required" }, { status: 401 });
  }

  return true;
}
