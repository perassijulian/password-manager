import { prisma } from "@/lib/prisma";
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

    const user = await prisma.user.findUnique({ where: { email } });

    let emailBody;
    if (user) {
      emailBody =
        "You are receiving this mail because you asked to reset your password.";
    } else {
      emailBody =
        "You are receiving this mail because you asked to reset your password. You are not registered on our db with this mail, please register first";
    }
    const res = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Password reset",
      text: emailBody,
    });

    if (res.error) {
      console.error("Error when sending reset-password email: ", res.error);
      return {
        ok: false,
        response: NextResponse.json({ error: "Server error" }, { status: 500 }),
      };
    }
    // We will return the same response if there's a registered user or if there isn't
    // This way there's no enumeration vulnerability risk
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error when calling reset-password: ", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
