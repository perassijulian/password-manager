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

  response.cookies.set("csrf_token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  response.headers.set("Cache-Control", "no-store");
  return response;
}
