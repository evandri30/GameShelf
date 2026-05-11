import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { LoginSchema } from "@/schemas/auth.schema"

export const { handlers, auth } = NextAuth({
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
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
        async signIn({ user, account }) {
            if (account?.provider === "google" || account?.provider === "github") {
                if (!user.email) return false;

                try {
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email }
                    });

                    if (!existingUser) {
                        await prisma.user.create({
                            data: {
                                email: user.email,
                                name: user.name || "User",
                                image: user.image || "",
                                provider: account.provider
                            }
                        });
                    }
                } catch (error) {
                    console.error("Error during OAuth sign in:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            if (account?.provider === "google" || account?.provider === "github") {
                if (token.email) {
                    const dbUser = await prisma.user.findUnique({
                        where: { email: token.email }
                    });
                    if (dbUser) {
                        token.id = dbUser.id;
                    }
                }
            } else if (user) {
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

export const GET = handlers.GET;
export const POST = handlers.POST;