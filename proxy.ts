import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
  function proxy(req: NextRequest & { nextauth?: { token?: { role?: string } } }) {
    const token = req.nextauth?.token;
    const path = req.nextUrl.pathname;

    // Admin routes
    if (path.startsWith("/admin")) {
      if (!token?.role || (token.role !== "admin" && token.role !== "superadmin")) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    // Merchant routes
    if (path.startsWith("/merchant")) {
      if (!token?.role || token.role !== "merchant") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Allow access to login page
        if (path === "/login") {
          return true;
        }

        // Require authentication for protected routes
        if (path.startsWith("/admin") || path.startsWith("/merchant")) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/merchant/:path*"],
};

