import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { verifyToken } from "@/utils/verifyToken";
import { checkRateLimit } from "@/lib/checkRateLimit";
import { z } from "zod";

const CredentialSchema = z.object({
  service: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json(
        { error: "Unauthorized, missing token" },
        { status: 401 }
      );
    const payload = await verifyToken(token);
    if (!payload)
      return NextResponse.json(
        { error: "Unauthorized, missing payload" },
        { status: 401 }
      );

    const rateLimitCheck = await checkRateLimit(req);
    if (!rateLimitCheck.ok) {
      return rateLimitCheck.response;
    }

    const result = CredentialSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { service, username, password } = result.data;

    const encryptedPassword = encrypt(password);

    const credential = await prisma.credential.create({
      data: {
        userId: payload.userId,
        service,
        username,
        password: encryptedPassword,
      },
    });

    return NextResponse.json(
      {
        credential: {
          id: credential.id,
          service: credential.service,
          username: credential.username,
          createdAt: credential.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/credentials/add:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
