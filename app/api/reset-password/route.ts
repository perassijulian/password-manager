import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const paramsSchema = z.object({
  email: z.string(),
});

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const rawParams = await req.json();
    const parsedParams = paramsSchema.safeParse(rawParams);

    if (!parsedParams || !parsedParams.data?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { email } = parsedParams.data;

    const res = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Reset your password",
      text: "You are receiving this mail because you asked to reset your password.",
    });

    if (res.error) {
      console.error("Error when sending reset-password email: ", res.error);
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Server error." },
          { status: 500 }
        ),
      };
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error when calling reset-password: ", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
