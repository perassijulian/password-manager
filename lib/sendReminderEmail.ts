import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
type SendEmailResult = { ok: true } | { ok: false; response: NextResponse };

export async function sendReminderEmail(
  email: string
): Promise<SendEmailResult> {
  try {
    const res = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Your account already been registered",
      html: `<p>Your email ${email} is already registered. If you forgot your password you can reset it on our website</p>`,
      text: `Your email ${email} is already registered. If you forgot your password you can reset it on our website`,
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
