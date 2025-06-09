import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import validateSecureRequest from "@/lib/validateSecureRequest";
import { z } from "zod";

const ParamsSchema = z.object({});

type Credential = {
  id: string;
  service: string;
  username: string;
  password: string;
};

export async function GET(req: NextRequest) {
  try {
    console.log("GETING 12312312312312312");
    // Perform rate limiting, parameter validation, CSRF/device checks, and token authentication
    const secure = await validateSecureRequest({
      req,
      ParamsSchema,
      source: "none",
    });
    if (!secure.ok) return secure.response;

    console.log(secure, "1232132312312312");
    const { payload } = secure;

    // Get all the credentials from the user
    const credentials = await prisma.credential.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: "desc" },
    });

    console.log(credentials, "CREDENTIALS!!!!!!!!!!!");
    // Decrypt the password beggining and ending
    const decrypted = credentials.map((c: Credential) => ({
      id: c.id,
      service: c.service,
      username: c.username,
      password:
        decrypt(c.password).slice(0, 2) +
        "*****" +
        decrypt(c.password).slice(-2),
      // Note: For security, we only show the first 2 and last 2 characters of the decrypted password
      // to show that the decryption was successful without exposing the full password.
      // If you need the full password, you must re-authenticate.
    }));

    // Return success
    return NextResponse.json({ credentials: decrypted }, { status: 200 });
  } catch (error) {}
}
