import { prisma } from "@/lib/prisma";

type Params = {
  userId: string;
  deviceId?: string;
  context: string;
  actionType?: string;
};

export async function markTwoFAChallengeVerified({
  userId,
  deviceId,
  context,
  actionType,
}: Params) {
  const now = new Date();

  const result = await prisma.twoFAChallenge.updateMany({
    where: {
      userId,
      method: "TOTP",
      expiresAt: { gt: now },
      context,
      ...(actionType ? { actionType } : {}),
      ...(deviceId ? { deviceId } : {}),
    },
    data: {
      isVerified: true,
      verifiedAt: now,
    },
  });

  return result;
}
