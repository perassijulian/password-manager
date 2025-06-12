import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const report = await req.json();
    console.log("CSP Violation Report:", JSON.stringify(report, null, 2));
  } catch (err) {
    console.error("Error parsing CSP report:", err);
  }

  return NextResponse.json({ status: 204 });
}
