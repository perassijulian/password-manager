import { NextResponse } from "next/server";

export async function POST() {
  const response = new NextResponse(null, { status: 200 });
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
