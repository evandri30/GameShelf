import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma/client'
import bcrypt from "bcryptjs";
import { RegisterSchema } from "@/schemas/auth.schema"
import { generateUniqueUsername } from "@/services/user.service"
import { clientIp, rateLimit } from "@/lib/rate-limit"


export async function POST(req: Request) {
    let emailForConflict: string | null = null
    try {
        // at most 5 new accounts per network per hour
        const limit = await rateLimit(`register:ip:${clientIp(req.headers)}`, 5, 60 * 60 * 1000)
        if (!limit.ok) {
            return NextResponse.json(
                { error: "Too many sign-ups from this network. Try again later." },
                { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
            )
        }

        const body = await req.json().catch(() => null)
        if (!body) {
            return NextResponse.json({ error: "Invalid Input" }, { status: 400 })
        }

        const result = RegisterSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json({ error: "Invalid Input" }, { status: 400 })
        }

        const { name, password } = result.data
        // stored lowercase and compared case-insensitively, so one address can't make two accounts
        const email = result.data.email.trim().toLowerCase()
        emailForConflict = email

        const existingUser = await prisma.user.findFirst({
            where: { email: { equals: email, mode: "insensitive" } }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "Email already exist" },
                { status: 400 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                // can be changed later from the Profile page
                username: await generateUniqueUsername(name || email)
            }
        })

        return NextResponse.json(
            { message: "User Created Successfully ", userId: user.id },
            { status: 201 }
        )

    } catch (error) {
        // two sign-ups with the same email can both pass the check above; the unique index stops the second
        if (
            error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002" &&
            emailForConflict && await prisma.user.findUnique({ where: { email: emailForConflict }, select: { id: true } })
        ) {
            return NextResponse.json({ error: "Email already exist" }, { status: 400 })
        }
        console.error("Register Error: ", error)
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}