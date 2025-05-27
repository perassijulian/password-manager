import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { verifyToken } from "@/utils/verifyToken";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({ error: "Unauthorized, missing token" });
  const payload = await verifyToken(token);
  if (!payload)
    return res.status(401).json({ error: "Unauthorized, missing payload" });

  const { service, username, password } = req.body;

  if (!service || !username || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const encryptedPassword = encrypt(password);

  const credential = await prisma.credential.create({
    data: {
      userId: payload.userId,
      service,
      username,
      password: encryptedPassword,
    },
  });

  return res.status(201).json({ credential });
}
