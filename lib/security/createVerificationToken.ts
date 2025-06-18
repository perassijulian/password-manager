import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const cuidSchema = z.string().cuid();

export async function createVerificationToken(userId: string) {
  cuidSchema.parse(userId);

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

  await prisma.verificationToken.create({
    data: { userId, token, expiresAt },
  });

  return token;
}
