import { verifyToken } from "@/utils/verifyToken";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { checkRateLimit } from "@/lib/checkRateLimit";
import { z } from "zod";
import { authorizeSensitiveAction } from "@/utils/authorizeSensitiveAction";
import { validateApiRequest } from "@/lib/secureApi";
import { cookies } from "next/headers";

const ParamsSchema = z.object({
  id: z.string().cuid(),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimitCheck = await checkRateLimit(req);
    if (!rateLimitCheck.ok) {
      return rateLimitCheck.response;
    }

    const rawParams = await context.params;
    const parseResult = ParamsSchema.safeParse(rawParams);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid credential ID" },
        { status: 400 }
      );
    }
    const { id: parsedId } = parseResult.data;

    const cookieStore = await cookies();
    const validation = validateApiRequest(req.headers, cookieStore);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 403 });
    }
    const deviceId = validation.deviceId;
    if (!deviceId) {
      return NextResponse.json({ error: "Device ID missing" }, { status: 400 });
    }

    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload)
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });

    const authResult = await authorizeSensitiveAction(
      payload.userId,
      "copy_password",
      "sensitive",
      deviceId
    );

    if (authResult !== true) {
      return NextResponse.json({ error: "2FA required" }, { status: 401 });
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

    const decryptedPassword = decrypt(credential.password);

    return NextResponse.json({ password: decryptedPassword }, { status: 200 });
  } catch (error) {
    console.error("POST /api/credentials/[id]/copy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
