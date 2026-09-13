import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

const protectedPaths = [
  "/overview",
  "/reviews",
  "/feedback",
  "/send",
  "/analytics",
  "/settings",
  "/billing",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!protectedPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/overview/:path*",
    "/reviews/:path*",
    "/feedback/:path*",
    "/send/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/billing/:path*",
  ],
};
