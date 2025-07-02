import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { timingSafeEqual } from "crypto";
import { CsrfError } from "../errors/SecureRequestError";

function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);

  // Prevent leaking length info
  if (aBuf.length !== bBuf.length) return false;

  return timingSafeEqual(aBuf, bBuf);
}

export function validateCsrfRequest(
  headers: Headers,
  cookies: ReadonlyRequestCookies
) {
  const csrfTokenFromCookie = cookies.get("csrf_token")?.value;
  const csrfTokenFromHeader = headers.get("x-csrf-token");

  if (
    !csrfTokenFromCookie ||
    !csrfTokenFromHeader ||
    !safeCompare(csrfTokenFromHeader, csrfTokenFromCookie)
  ) {
    console.error("CSRF validation failed: Token mismatch or missing");
    throw new CsrfError();
  }

  const deviceId = headers.get("x-device-id");
  if (!deviceId) {
    console.error("CSRF validation failed: Missing device ID");
    throw new CsrfError();
  }

  return { deviceId };
}
