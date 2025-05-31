import { verify2FA } from "@/lib/2fa";
import { decrypt } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/utils/verifyToken";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload)
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });

    const body = await req.json();
    const schema = z.object({ code: z.string().length(6) });
    const { code } = schema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user?.twoFactorEnabled)
      return NextResponse.json({ error: "2FA not setup" }, { status: 400 });

    if (!user.twoFactorSecret)
      return NextResponse.json(
        { error: "2FA secret missing" },
        { status: 500 }
      );

    const secret = decrypt(user.twoFactorSecret);
    const valid = verify2FA(secret, code);

    if (!valid)
      return NextResponse.json({ error: "Invalid code" }, { status: 403 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in 2FA verification:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
