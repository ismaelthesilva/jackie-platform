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
    const dashboardPath = session.role === "PT" ? "/pt" : "/member";
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  // Role-based route protection
  if (session) {
    // PT trying to access member routes
    if (session.role === "PT" && path.startsWith("/member")) {
      return NextResponse.redirect(new URL("/pt", request.url));
    }

    // Member trying to access PT routes
    if (session.role === "MEMBER" && path.startsWith("/pt")) {
      return NextResponse.redirect(new URL("/member", request.url));
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
