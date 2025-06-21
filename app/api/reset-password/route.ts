import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rateLimit/withRateLimit";
import createResetPasswordToken from "@/lib/security/createResetPasswordToken";
import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email(),
});

const tokenSchema = z.object({
  token: z.string().length(64),
});

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    return withRateLimit(req, async () => {
      const rawParams = await req.json();
      const parsedParams = emailSchema.safeParse(rawParams);

      if (!parsedParams || !parsedParams.data?.email)
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

      const { email } = parsedParams.data;

      const user = await prisma.user.findUnique({ where: { email } });

      let emailBody;
      if (user) {
        const createToken = await createResetPasswordToken(user.id);
        if (!createToken.ok || !createToken.token) {
          console.error("Error creating reset password token");
          return NextResponse.json({ error: "Server error" }, { status: 500 });
        } else {
          const token = createToken.token;
          const verificationUrl = `${process.env.APP_URL}/api/reset-password?token=${encodeURIComponent(token)}`;

          emailBody = `You are receiving this mail because you asked to reset your password. Please click on this link: ${verificationUrl}`;
        }
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
        return NextResponse.json({ error: "Server error" }, { status: 500 });
      }
      // We will return the same response if there's a registered user or if there isn't
      // This way there's no enumeration vulnerability risk
      return NextResponse.json({ success: true });
    });
  } catch (error) {
    console.error("Error when calling reset-password: ", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    return withRateLimit(req, async () => {
      const { searchParams } = new URL(req.url);
      const rawToken = searchParams.get("token");

      const parsedToken = tokenSchema.safeParse({ token: rawToken });
      if (!parsedToken.success) {
        console.error(
          "Error when parsing reset-password token: ",
          parsedToken.error
        );
        return NextResponse.json({ error: "Invalid token" }, { status: 400 });
      }
      const { token } = parsedToken.data;
      const hashedToken = createHash("sha256").update(token).digest("hex");

      const res = await prisma.passwordResetToken.findUnique({
        where: { token: hashedToken },
      });

      if (!res?.userId) {
        return NextResponse.json({ error: "Invalid token" }, { status: 400 });
      }

      if (res.expiresAt < new Date()) {
        await prisma.passwordResetToken.deleteMany({
          where: { token: hashedToken },
        });
        return NextResponse.json({ error: "Invalid token" }, { status: 400 });
      }

      return NextResponse.redirect(
        `${process.env.APP_URL}/reset-password/change?token=${token}`
      );
    });
  } catch (error) {
    console.error("Error when verifying reset-password token: ", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
