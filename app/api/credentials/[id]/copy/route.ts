import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { z } from "zod";
import { authorizeSensitiveAction } from "@/lib/security/authorizeSensitiveAction";
import validateSecureRequest from "@/lib/security/validateSecureRequest";

const paramsSchema = z.object({
  id: z.string().cuid(),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Perform rate limiting, parameter validation, CSRF/device checks, and token authentication
    const secure = await validateSecureRequest({
      req,
      context,
      paramsSchema,
      source: "params",
    });
    if (!secure.ok) return secure.response;

    const { parsedParams, payload, deviceId } = secure;

    // Authorize sensitive action
    const authResult = await authorizeSensitiveAction(
      payload.userId,
      "copy_password",
      "sensitive",
      deviceId
    );

    if (authResult !== true) {
      return NextResponse.json({ error: "2FA required" }, { status: 401 });
    }

    // Fetch and decrypt credential
    const { id } = parsedParams;
    const credential = await prisma.credential.findUnique({
      where: { id, userId: payload.userId },
    });

    if (!credential || credential.userId !== payload.userId) {
      return NextResponse.json(
        { error: "Credential not found or access denied" },
        { status: 404 }
      );
    }

    const decryptedPassword = decrypt(credential.password);

    // Return success
    return NextResponse.json({ password: decryptedPassword }, { status: 200 });
  } catch (error) {
    console.error("POST /api/credentials/[id]/copy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
