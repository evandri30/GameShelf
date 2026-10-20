import { cache } from "react";
import { connection } from "next/server";
import NextAuth, { CredentialsSignin } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { LoginSchema } from "@/schemas/auth.schema"
import { clientIp, rateLimit, resetRateLimit } from "@/lib/rate-limit"

// signIn() on the client receives this as result.code
class RateLimited extends CredentialsSignin {
    code = "rate_limited"
}

const LOGIN_WINDOW_MS = 15 * 60 * 1000

export const { handlers, auth } = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, request) {
                const result = LoginSchema.safeParse(credentials)

                if (!result.success) {
                    return null
                }

                const { password } = result.data
                const email = result.data.email.trim().toLowerCase()
                const emailKey = `login:email:${email}`

                // slow down password guessing: 20 tries per network and 5 per account every 15 minutes
                const [byIp, byEmail] = await Promise.all([
                    rateLimit(`login:ip:${clientIp(request.headers)}`, 20, LOGIN_WINDOW_MS),
                    rateLimit(emailKey, 5, LOGIN_WINDOW_MS),
                ])
                if (!byIp.ok || !byEmail.ok) throw new RateLimited()

                try {
                    // case-insensitive, so "Me@x.com" and "me@x.com" are the same account
                    const user = await prisma.user.findFirst({
                        where: { email: { equals: email, mode: "insensitive" } },
                    });

                    if (!user || !user.password) return null;

                    const isPasswordValid = await bcrypt.compare(
                        password,
                        user.password
                    );

                    if (!isPasswordValid) return null;

                    // a successful login clears the account's failed attempts
                    await resetRateLimit(emailKey)

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            },
        }),
    ],
    session: { strategy: "jwt" },
    // Auth.js only trusts the request host automatically on Vercel; anywhere else (next start, Docker,
    // a VPS) every auth request fails with UntrustedHost without this or AUTH_TRUST_HOST=true
    trustHost: true,
    pages: { signIn: "/auth" },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
            }
            return session
        }
    }
});

// auth() touches crypto and the clock before it reads the session cookie, which Cache Components
// rejects during prerendering. connection() marks the caller as request-time first.
// Use this in Server Components; route handlers and Server Actions can call auth() directly.
// cache(): the navbar, mobile tab bar and page share one session lookup per request.
export const getSession = cache(async () => {
    await connection()
    return auth()
})
