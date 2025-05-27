import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/verifyToken";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token)
    return NextResponse.json({ error: "No token provided" }, { status: 401 });

  const payload = await verifyToken(token);

  if (!payload)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  return NextResponse.json({ userId: payload.userId }, { status: 200 });
}
