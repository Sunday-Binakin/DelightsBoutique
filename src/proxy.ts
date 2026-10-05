import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "db_admin_session";

// Presence check only — the cookie is HttpOnly so its contents can't be read or verified
// here. This just avoids rendering protected pages before the client-side session check
// (see (protected)/layout.tsx) has a chance to redirect. Real auth happens server-side.
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();

  if (!request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
