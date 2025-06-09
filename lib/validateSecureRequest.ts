import { cookies } from "next/headers";
import { checkRateLimit } from "./checkRateLimit";
import { validateApiRequest } from "./secureApi";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/verifyToken";
import { z } from "zod";
import { JWTPayload } from "@/types";

type ErrorResult = { ok: false; response: NextResponse };
type SuccessResult<T> = {
  ok: true;
  parsedParams: T;
  payload: JWTPayload;
  deviceId: string;
};
type Result<T> = SuccessResult<T> | ErrorResult;

export default async function validateSecureRequest<T extends z.ZodTypeAny>({
  req,
  context,
  ParamsSchema,
}: {
  req: NextRequest;
  context: { params: Promise<{ id: string }> };
  ParamsSchema: T;
}): Promise<Result<z.infer<T>>> {
  // 1. Rate Limiting
  const rateLimitCheck = await checkRateLimit(req);
  if (!rateLimitCheck.ok) {
    return { ok: false, response: rateLimitCheck.response };
  }

  // 2. Validate route params
  const rawParams = await context.params;
  const parseResult = ParamsSchema.safeParse(rawParams);
  if (!parseResult.success) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid credential ID" },
        { status: 400 }
      ),
    };
  }

  // 3. Validate API request (CSRF + device ID)
  const cookieStore = await cookies();
  const validation = validateApiRequest(req.headers, cookieStore);
  if (!validation.valid) {
    return {
      ok: false,
      response: NextResponse.json({ error: validation.error }, { status: 403 }),
    };
  }
  const deviceId = validation.deviceId;
  if (!deviceId) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Device ID missing" },
        { status: 400 }
      ),
    };
  }

  // 4. Auth token
  const token = req.cookies.get("token")?.value;
  if (!token)
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };

  const payload = await verifyToken(token);
  if (!payload)
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid token" }, { status: 403 }),
    };

  return { ok: true, parsedParams: parseResult.data, payload, deviceId };
}
