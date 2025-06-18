import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
type SendEmailResult = { ok: true } | { ok: false; response: NextResponse };

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<SendEmailResult> {
  try {
    const verificationUrl = `${process.env.APP_URL}/api/verify?token=${encodeURIComponent(token)}`;
    const res = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Verify your account",
      html: `<p>Click to verify: <a href="${verificationUrl}">${verificationUrl}</a></p>`,
      text: `Verify your account: ${verificationUrl}`,
    });
    if (res.error) {
      console.error("Resend API Error:", res.error);
      return {
        ok: false,
        response: NextResponse.json({ error: "Server error" }, { status: 500 }),
      };
    }
    return {
      ok: true,
    };
  } catch (error) {
    console.error("Error while sending mail: ", error);
    return {
      ok: false,
      response: NextResponse.json({ error: "Server error" }, { status: 500 }),
    };
  }
}
