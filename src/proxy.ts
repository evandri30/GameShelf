import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
    const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET
    })
    const { pathname } = req.nextUrl

    // signed in: skip the landing page
    if (token && pathname === "/") {
        return NextResponse.redirect(new URL("/games", req.url))
    }

    // signed out: private pages go to the landing page (shared stats links stay open)
    if (!token && (pathname.startsWith("/games") || pathname.startsWith("/shelf") || pathname.startsWith("/profile") || (pathname.startsWith("/dashboard") && !pathname.startsWith("/dashboard/share")))) {
        return NextResponse.redirect(new URL("/", req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/", "/games/:path*", "/shelf/:path*", "/profile/:path*", "/dashboard/:path*"],
};