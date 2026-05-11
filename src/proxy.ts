import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
    const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET
    })
    const { pathname } = req.nextUrl

    // Kalau sudah login
    if (token && pathname === "/") {
        return NextResponse.redirect(new URL("/games", req.url))
    }

    // Kalau belum login
    if (!token && (pathname.startsWith("/games") || pathname.startsWith("/shelf"))) {
        return NextResponse.redirect(new URL("/", req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/", "/games/:path*", "/shelf/:path*"],
};