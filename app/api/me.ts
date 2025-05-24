import { NextApiRequest, NextApiResponse } from "next";
import { jwtVerify } from "jose";
import { verifyToken } from "@/utils/verifyToken";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.cookies.token;

  if (!token) return res.status(401).end();

  const payload = await verifyToken(token);
  if (!payload) return res.status(401).json({ error: "Invalid token" });

  res.status(200).json({ userId: payload.userId });
}
