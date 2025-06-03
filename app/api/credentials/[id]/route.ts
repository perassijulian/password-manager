import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { verifyToken } from "@/utils/verifyToken";
import { checkRateLimit } from "@/lib/checkRateLimit";

const ParamsSchema = z.object({
  id: z.string().cuid(),
});

export async function DELETE(
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
      where: { id: parsedId },
    });

    if (!credential || credential.userId !== payload.userId) {
      return NextResponse.json(
        { error: "Credential not found or access denied" },
        { status: 404 }
      );
    }

    try {
      await prisma.credential.delete({ where: { id: parsedId } });
    } catch (err: any) {
      if (err.code === "P2025") {
        // Prisma "record not found"
        return NextResponse.json(
          { error: "Credential already deleted" },
          { status: 404 }
        );
      }
      throw err;
    }

    return NextResponse.json(
      { message: "Deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE /api/credentials/[id] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
