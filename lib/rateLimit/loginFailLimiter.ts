import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/utils/getClientIp";
import { redis } from "./redis";

type LoginFailResult = { ok: true } | { ok: false; response: NextResponse };
export async function checkLoginFailLimit(
  email: string,
  req: NextRequest
): Promise<LoginFailResult> {
  const ip = getClientIp(req);
  const key = `login:fail:${email}_${ip}`;
  const attempts = await redis.incr(key);

  if (attempts === 1) {
    await redis.expire(key, 60 * 5); // expire after 5 minutes
  }

  if (attempts > 3) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Too many requests, please try again later." },
        { status: 429 }
      ),
    };
  }

  return { ok: true }; // no lock
}

export async function resetLoginFailLimit(email: string, req: NextRequest) {
  const ip = getClientIp(req);
  const key = `login:fail:${email}_${ip}`;
  await redis.del(key);
}
