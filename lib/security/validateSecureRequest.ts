import { cookies } from "next/headers";
import { checkRateLimit } from "../rateLimit/checkRateLimit";
import { validateCsrfRequest } from "./secureCsrf";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/verifyToken";
import { z } from "zod";
import { JWTPayload } from "@/types";
import {
  BadRequestError,
  SecureRequestError,
  UnauthorizedError,
} from "../errors/SecureRequestError";

type ErrorResult = { ok: false; response: NextResponse };
type SuccessResult<T> = {
  ok: true;
  parsedParams: T;
  payload: JWTPayload;
  deviceId: string;
};
type Result<T> = SuccessResult<T> | ErrorResult;

async function getRawParams(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } | undefined,
  source: "body" | "params" | "none"
): Promise<Record<string, any>> {
  if (source === "params") {
    if (!context?.params) {
      console.error("Missing URL params context");
      throw new BadRequestError();
    }
    return await context.params;
  }

  if (source === "body") {
    try {
      return await req.json();
    } catch {
      console.error("Invalid or missing request body");
      throw new BadRequestError();
    }
  }

  return {}; // "none"
}

export default async function validateSecureRequest<T>({
  req,
  context,
  paramsSchema,
  source = "none",
}: {
  req: NextRequest;
  context?: { params: Promise<{ id: string }> };
  paramsSchema: z.ZodType<T>;
  source?: "body" | "params" | "none";
}): Promise<Result<T>> {
  try {
    // 1. Rate Limiting
    await checkRateLimit(req);

    // 2. Validate route params or body (if provided)
    const rawParams = await getRawParams(req, context, source);
    const parseResult = paramsSchema.safeParse(rawParams);
    if (!parseResult.success) {
      console.error("Request parameter validation failed", parseResult.error);
      throw new BadRequestError();
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
  } catch (error) {
    if (error instanceof SecureRequestError) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: error.message },
          { status: error.status }
        ),
      };
    }

    console.error("Unexpected error during secure request validation:", error);
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      ),
    };
  }
}
