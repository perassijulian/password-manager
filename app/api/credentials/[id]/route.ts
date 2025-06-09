import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { verifyToken } from "@/utils/verifyToken";
import { checkRateLimit } from "@/lib/checkRateLimit";
import { cookies } from "next/headers";
import { validateApiRequest } from "@/lib/secureApi";

const ParamsSchema = z.object({
  id: z.string().cuid(),
});

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Rate Limiting
    const rateLimitCheck = await checkRateLimit(req);
    if (!rateLimitCheck.ok) {
      return rateLimitCheck.response;
    }

    // 2. Validate route params
    const rawParams = await context.params;
    const parseResult = ParamsSchema.safeParse(rawParams);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid credential ID" },
        { status: 400 }
      );
    }
    const { id: parsedId } = parseResult.data;

    // 3. Validate API request (CSRF + device ID)
    const cookieStore = await cookies();
    const validation = validateApiRequest(req.headers, cookieStore);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 403 });
    }
    const deviceId = validation.deviceId;
    if (!deviceId) {
      return NextResponse.json({ error: "Device ID missing" }, { status: 400 });
    }

    // 4. Validate token
    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload)
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });

    // Optional: wrap this in authorizeSensitiveAction if this becomes a
    // sensitive action
    // 5. Authorize sensitive action
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

    // 6. Fetch credential
    const credential = await prisma.credential.findUnique({
      where: { id: parsedId, userId: payload.userId },
    });

    if (!credential || credential.userId !== payload.userId) {
      return NextResponse.json(
        { error: "Credential not found or access denied" },
        { status: 404 }
      );
    }

    // 7. Delete credential
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

    // 8. Return success
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
