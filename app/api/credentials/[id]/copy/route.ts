import { verifyToken } from "@/utils/verifyToken";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { checkRateLimit } from "@/lib/checkRateLimit";
import { z } from "zod";

const ParamsSchema = z.object({
  id: z.string().cuid(),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const parseResult = ParamsSchema.safeParse({ id });
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid credential ID" },
        { status: 400 }
      );
    }
    const { id: parsedId } = parseResult.data;

    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload)
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });

    const rateLimitCheck = await checkRateLimit(req);
    if (!rateLimitCheck.ok) {
      return rateLimitCheck.response;
    }

    const credential = await prisma.credential.findUnique({
      where: { id: parsedId, userId: payload.userId },
    });

    if (!credential || credential.userId !== payload.userId) {
      return NextResponse.json(
        { error: "Credential not found or access denied" },
        { status: 404 }
      );
    }

    const fullPassword = decrypt(credential.password);

    return NextResponse.json({ password: fullPassword }, { status: 200 });
  } catch (error) {
    console.error("POST /api/credentials/[id]/copy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
