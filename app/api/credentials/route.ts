import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { verifyToken } from "@/utils/verifyToken";

type Credential = {
  id: string;
  service: string;
  username: string;
  password: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({ error: "Unauthorized, missing token" });
  const payload = await verifyToken(token);
  if (!payload)
    return res.status(401).json({ error: "Unauthorized, missing payload" });

  const credentials = await prisma.credential.findMany({
    where: { userId: payload.userId },
    orderBy: { createdAt: "desc" },
  });

  const decrypted = credentials.map((c: Credential) => ({
    id: c.id,
    service: c.service,
    username: c.username,
    password: decrypt(c.password),
  }));

  res.status(200).json({ credentials: decrypted });
}
