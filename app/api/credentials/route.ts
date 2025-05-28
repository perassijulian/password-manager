import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { verifyToken } from "@/utils/verifyToken";

type Credential = {
  id: string;
  service: string;
  username: string;
  password: string;
};

export async function GET(req: NextRequest) {
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

  const credentials = await prisma.credential.findMany({
    where: { userId: payload.userId },
    orderBy: { createdAt: "desc" },
  });

  const decrypted = credentials.map((c: Credential) => ({
    id: c.id,
    service: c.service,
    username: c.username,
    password:
      decrypt(c.password).slice(0, 2) + "*****" + decrypt(c.password).slice(-2),
    // Note: For security, we only show the first 2 and last 2 characters of the decrypted password
    // to show that the decryption was successful without exposing the full password.
    // If you need the full password, you must re-authenticate.
  }));

  return NextResponse.json({ credentials: decrypted }, { status: 200 });
}
