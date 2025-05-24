import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { email, password } = schema.parse(req.body);
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    res.status(201).json({ message: "User created", userId: user.id });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(409).json({ error: "Email already in use" });
      }
    }

    res.status(400).json({ error: "Invalid input or server error" });
  }
}
