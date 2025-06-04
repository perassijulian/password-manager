import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import argon2 from "argon2";
import { z } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { checkRateLimit } from "@/lib/checkRateLimit";
import { hash } from "crypto";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const rateLimitCheck = await checkRateLimit(req);
    if (!rateLimitCheck.ok) {
      return rateLimitCheck.response;
    }
    const body = await req.json();
    const { email, password } = schema.parse(body);
    const hashedPassword = await argon2.hash(password);
    console.log("Creating user with email:", hashedPassword);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });
    console.log("User created with ID:", user.id);

    return NextResponse.json(
      { message: "User created", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Invalid input or server error" },
      { status: 500 }
    );
  }
}
