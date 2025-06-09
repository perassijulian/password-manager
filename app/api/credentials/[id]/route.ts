import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import validateSecureRequest from "@/lib/validateSecureRequest";

const ParamsSchema = z.object({
  id: z.string().cuid(),
});

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Perform rate limiting, parameter validation, CSRF/device checks, and token authentication
    const secure = await validateSecureRequest({
      req,
      context,
      ParamsSchema,
      source: "params",
    });
    if (!secure.ok) return secure.response;

    const { parsedParams, payload } = secure;

    // Optional: wrap this in authorizeSensitiveAction if this becomes a
    // sensitive action
    // Authorize sensitive action
    // const authResult = await authorizeSensitiveAction(
    //   payload.userId,
    //   "copy_password",
    //   "sensitive",
    //   deviceId
    // );
    //
    // if (authResult !== true) {
    //   return NextResponse.json({ error: "2FA required" }, { status: 401 });
    // }

    // Fetch credential
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

    // Delete credential
    try {
      await prisma.credential.delete({ where: { id } });
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

    // Return success
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
