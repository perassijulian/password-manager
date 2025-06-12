import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ROUTES = ["/", "/login", "/signup"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  let res: NextResponse;
  // Allow public routes to be accessed without authentication
  if (PUBLIC_ROUTES.includes(pathname)) {
    res = NextResponse.next();
  } else if (!token) {
    // Reject or redirect if token is missing
    res = pathname.startsWith("/api")
      ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", req.url));
  } else {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret); // will throw if invalid/expired
      res = NextResponse.next();
    } catch (err) {
      console.error("JWT verification failed:", err);
      res = pathname.startsWith("/api")
        ? NextResponse.json(
            { error: "Invalid or expired token" },
            { status: 401 }
          )
        : NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Content Security Policy (CSP)
  const csp =
    process.env.NODE_ENV === "development"
      ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; object-src 'none'; base-uri 'self';"
      : "default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self';";

  res.headers.set("Content-Security-Policy", csp);

  // Secure headers (browser hardening)
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Strict Transport Security (HSTS) in production
  if (
    process.env.NODE_ENV === "production" &&
    req.nextUrl.protocol === "https:"
  ) {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains"
      // "; preload" // enable when ready to submit to HSTS preload list
    );
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"], // Skip static assets
};
