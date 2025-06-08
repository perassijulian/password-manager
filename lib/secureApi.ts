import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { timingSafeEqual } from "crypto";

function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);

  // Prevent leaking length info
  if (aBuf.length !== bBuf.length) return false;

  return timingSafeEqual(aBuf, bBuf);
}

export function validateApiRequest(
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
    return { valid: false, error: "Invalid CSRF token" };
  }

  const deviceId = headers.get("x-device-id");
  if (!deviceId) {
    return { valid: false, error: "Missing device ID" };
  }

  return { valid: true, deviceId };
}
