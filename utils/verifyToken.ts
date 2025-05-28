import { jwtVerify } from "jose";
import type { JWTPayload } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET not set");

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    if (typeof payload.userId === "string") {
      return {
        userId: payload.userId,
        iat: typeof payload.iat === "number" ? payload.iat : undefined,
        exp: typeof payload.exp === "number" ? payload.exp : undefined,
      } as JWTPayload;
    }

    return null;
  } catch {
    return null;
  }
}
