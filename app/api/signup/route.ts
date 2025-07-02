import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import argon2 from "argon2";
import { z } from "zod";
import { withRateLimit } from "@/lib/rateLimit/withRateLimit";
import { createVerificationToken } from "@/lib/security/createVerificationToken";
import { sendVerificationEmail } from "@/lib/sendVerificationEmail";
import { sendReminderEmail } from "@/lib/sendReminderEmail";

const paramsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// 1. Always return a generic success response
// 2. Internally check if user exists
// 3. If user exists, send reminder email (optional)
// 4. If not, create user and send verification email

export async function POST(req: NextRequest) {
  try {
    return withRateLimit(req, async () => {
      // 1. Validate route params
      const rawParams = await req.json();
      const parseResult = paramsSchema.safeParse(rawParams);
      if (!parseResult.success) {
        console.error("Invalid request parameters:", parseResult.error);
        return NextResponse.json(
          { error: "Invalid request parameters" },
          { status: 400 }
        );
      }
      let { password, email } = parseResult.data;
      email = email.toLowerCase().trim();

      // 2. Check if user already registered
      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (!existingUser) {
        // 3. Hash password and create user
        const hashedPassword = await argon2.hash(password);
        const { id: userId } = await prisma.user.create({
          data: { email, password: hashedPassword },
        });

        // 4. Create token and send verification email
        const token = await createVerificationToken(userId);
        const emailSent = await sendVerificationEmail(email, token);

        if (!emailSent.ok) return emailSent.response;
      } else {
        const emailSent = await sendReminderEmail(email);
        if (!emailSent.ok) return emailSent.response;
      }

      // 4. Return success eiter way
      return NextResponse.json(
        { message: "Success signup! You will receive an email shortly" },
        { status: 201 }
      );
    });
  } catch (error) {
    console.error("Signup error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
