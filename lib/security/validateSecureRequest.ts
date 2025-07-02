import { cookies } from "next/headers";
import { checkRateLimit } from "../rateLimit/checkRateLimit";
import { validateCsrfRequest } from "./secureCsrf";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/verifyToken";
import { z } from "zod";
import { JWTPayload } from "@/types";
import { UnauthorizedError } from "../errors/SecureRequestError";

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
  source,
}: {
  req: NextRequest;
  context?: { params: Promise<{ id: string }> };
  ParamsSchema: T;
  source: "body" | "params" | "none";
}): Promise<Result<z.infer<T>>> {
  // 1. Rate Limiting
  const rateLimitCheck = await checkRateLimit(req);
  if (!rateLimitCheck.ok) {
    return { ok: false, response: rateLimitCheck.response };
  }

  // 2. Validate route params or body (if provided)
  let rawParams = {};
  if (source === "params" && context?.params) {
    rawParams = await context.params;
  } else if (source === "body") {
    try {
      rawParams = await req.json();
    } catch (error) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Invalid or missing request body" },
          { status: 400 }
        ),
      };
    }
  }

  const parseResult = ParamsSchema.safeParse(rawParams);
  if (!parseResult.success) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid Invalid request parameters" },
        { status: 400 }
      ),
    };
  }

  // 3. Validate API request (CSRF + device ID)
  const cookieStore = await cookies();
  const { deviceId } = validateCsrfRequest(req.headers, cookieStore);

  // 4. Auth token
  const token = req.cookies.get("token")?.value;
  if (!token) {
    console.error("No token found on cookies");
    throw new UnauthorizedError();
  }

  const payload = await verifyToken(token);

  return { ok: true, parsedParams: parseResult.data, payload, deviceId };
}
