import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import argon2 from "argon2";
import { z } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { withRateLimit } from "@/lib/withRateLimit";

const ParamsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

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

      // 2. Hash password
      const hashedPassword = await argon2.hash(password);
      const user = await prisma.user.create({
        data: { email, password: hashedPassword },
      });

      // 3. Return success
      return NextResponse.json(
        { message: "User created", userId: user.id },
        { status: 201 }
      );
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 409 }
        );
      }
    }
    console.error("Error in POST /api/signup", error);
    return NextResponse.json(
      { error: "Invalid input or server error" },
      { status: 500 }
    );
  }
}
