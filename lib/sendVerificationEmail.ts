import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  try {
    const verificationUrl = `${process.env.APP_URL}/verify?token=${encodeURIComponent(token)}`;
    await resend.emails.send({
      from: "no-reply@julianperassi.com",
      to: email,
      subject: "Verify your account",
      html: `<p>Click to verify: <a href="${verificationUrl}">${verificationUrl}</a></p>`,
      text: `Verify your account: ${verificationUrl}`,
    });
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
