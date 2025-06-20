import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import { hash } from "argon2";

const paramsSchema = z.object({
  password: z.string(),
  token: z.string().length(64),
});

export async function POST(req: NextRequest) {
  try {
    const rawParams = await req.json();
    const parsedParams = paramsSchema.safeParse(rawParams);

    if (!parsedParams.success) {
      console.error(
        "Error while parsing params on POST /api/reset-password/change: ",
        parsedParams.error
      );
      return NextResponse.json({ error: "Server error" }, { status: 400 });
    }

    const { token, password } = parsedParams.data;

    const hashedToken = createHash("sha256").update(token).digest("hex");
    const resetTokenFound = await prisma.passwordResetToken.findUnique({
      where: { token: hashedToken },
    });
    if (!resetTokenFound?.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }
    if (resetTokenFound.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { token: hashedToken } });
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const { userId } = resetTokenFound;
    const hashedPassword = await hash(password);

    const userUpdated = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    if (!userUpdated) {
      console.error("Error while updating user password");
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    } else {
      await prisma.passwordResetToken.delete({ where: { token: hashedToken } });
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("Error while POST /api/reset-password/change: ", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
