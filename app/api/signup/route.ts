import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import argon2 from "argon2";
import { z } from "zod";
import { withRateLimit } from "@/lib/rateLimit/withRateLimit";

const ParamsSchema = z.object({
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
      const parseResult = ParamsSchema.safeParse(rawParams);
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
        // 3. Hash password
        const hashedPassword = await argon2.hash(password);
        await prisma.user.create({
          data: { email, password: hashedPassword },
        });

        // TODO: Send verification email
        // await sendVerificationEmail(email)
      } else {
        // TODO: Send reminder email
        // await sendReminderEmail(email)
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
