import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'
import bcrypt from "bcryptjs";
import { RegisterSchema } from "@/schemas/auth.schema"


export async function POST(req: Request) {
    try {
        const body = await req.json()

        const result = RegisterSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json({ error: "Invalid Input" }, { status: 400 })
        }

        const { name, email, password } = result.data

        const existingUser = await prisma.user.findUnique({
            where: { email }
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
                name
            }
        })

        return NextResponse.json(
            { message: "User Created Successfully ", userId: user.id },
            { status: 201 }
        )

    } catch (error) {
        console.log("Register Error: ", error)
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    }
}