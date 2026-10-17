import { connection } from "next/server";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { LoginSchema } from "@/schemas/auth.schema"

export const { handlers, auth } = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    const result = LoginSchema.safeParse(credentials)

                    if (!result.success) {
                        return null
                    }

                    const { email, password } = result.data

                    const user = await prisma.user.findUnique({
                        where: { email },
                    });

                    if (!user || !user.password) return null;

                    const isPasswordValid = await bcrypt.compare(
                        password,
                        user.password
                    );

                    if (!isPasswordValid) return null;

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
export async function getSession() {
    await connection()
    return auth()
}
