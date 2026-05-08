import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Protect /supadmin and /api/supadmin
  if (pathname.startsWith("/supadmin") || pathname.startsWith("/api/supadmin")) {
    const token = req.cookies.get("admin_token")?.value;

    if (!token) {
      if (pathname.startsWith("/api/supadmin")) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const payload = await verifyToken(token);

    if (!payload || payload.role !== "superadmin") {
      if (pathname.startsWith("/api/supadmin")) {
        return NextResponse.json({ message: "Forbidden: Superadmin only" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  // Protect /admin and /api/admin paths
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (pathname === "/api/admin/register") {
      return NextResponse.next();
    }

    const token = req.cookies.get("admin_token")?.value;

    if (!token) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const payload = await verifyToken(token);

    if (!payload || !["admin", "superadmin"].includes(payload.role)) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/supadmin/:path*",
    "/api/supadmin/:path*"
  ],
};
