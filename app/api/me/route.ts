import { NextRequest, NextResponse } from "next/server";
import { verifyUserToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const payload = await verifyUserToken(req);
    if (payload instanceof NextResponse) return payload;
    return NextResponse.json({ userId: payload.userId }, { status: 200 });
  } catch (error) {
    console.error("Error while GET /api/me");
    return NextResponse.json(
      { error: "Error while GET /api/me" },
      { status: 500 }
    );
  }
}
