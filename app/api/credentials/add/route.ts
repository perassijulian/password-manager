import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { verifyToken } from "@/utils/verifyToken";
import { checkRateLimit } from "@/lib/checkRateLimit";

export async function POST(req: NextRequest) {
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

  const { service, username, password } = body;

  if (!service || !username || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const encryptedPassword = encrypt(password);

  const credential = await prisma.credential.create({
    data: {
      userId: payload.userId,
      service,
      username,
      password: encryptedPassword,
    },
  });

  return NextResponse.json({ credential }, { status: 201 });
}
