import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Public paths that don't require authentication
  const isPublicPath =
    path === "/login" ||
    path === "/register" ||
    path === "/" ||
    path === "/about" ||
    path === "/contact" ||
    path.startsWith("/api/v1/auth/login") ||
    path.startsWith("/api/v1/auth/register");

  // Get session
  const session = await getSession();

  // Redirect to login if accessing protected route without session
  if (!isPublicPath && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect to appropriate dashboard if logged in user tries to access auth pages
  if (session && (path === "/login" || path === "/register")) {
    const dashboardPath = session.role === "PT" ? "/pt" : "/members/me";
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  // Role-based route protection
  if (session) {
    // Member trying to access PT routes -> send them to their member view
    if (session.role === "MEMBER" && path.startsWith("/pt")) {
      return NextResponse.redirect(new URL("/members/me", request.url));
    }

    // Member trying to access other members' pages or the PT members list
    if (session.role === "MEMBER" && path.startsWith("/members")) {
      const userId = (session as any).userId;
      const allowedPrefix = `/members/${userId}`;
      const isAllowed =
        path === "/members/me" ||
        path === `/members/${userId}` ||
        path.startsWith(allowedPrefix + "/");

      if (!isAllowed) {
        return NextResponse.redirect(new URL("/members/me", request.url));
      }
    }
  }

  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
