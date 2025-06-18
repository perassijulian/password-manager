import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import argon2 from "argon2";

const cuidSchema = z.string().cuid();

export async function createVerificationToken(userId: string) {
  cuidSchema.parse(userId);

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

  const hashedToken = await argon2.hash(token);

  await prisma.verificationToken.create({
    data: { userId, token: hashedToken, expiresAt },
  });

  return token;
}
