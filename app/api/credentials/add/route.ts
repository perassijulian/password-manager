import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { z } from "zod";
import validateSecureRequest from "@/lib/security/validateSecureRequest";

const paramsSchema = z.object({
  service: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    // Perform rate limiting, parameter validation, CSRF/device checks, and token authentication
    const secure = await validateSecureRequest({
      req,
      paramsSchema,
      source: "body",
    });
    if (!secure.ok) return secure.response;

    const { parsedParams, payload } = secure;

    // Encrypt password
    const { service, username, password } = parsedParams;
    const encryptedPassword = encrypt(password);

    // Create new credential
    const credential = await prisma.credential.create({
      data: {
        userId: payload.userId,
        service,
        username,
        password: encryptedPassword,
      },
    });

    // Return success
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
