import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { createUserShelf } from '@/services/shelf.service'
import { CreateShelfSchema } from "@/schemas/shelf.schema"
import { Prisma } from '@/generated/prisma/client'

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return new Response("Unauthorized", { status: 401 })
    }

    const body = await req.json().catch(() => null)

    const result = CreateShelfSchema.safeParse(body)

    if (!result.success) {
        return NextResponse.json(
            { error: "Invalid Input" }, { status: 400 }
        )
    }

    const { rawgId, title, slug, backgroundImage } = result.data

    try {
        const shelf = await createUserShelf(
            session.user.id,
            rawgId,
            title,
            slug,
            backgroundImage
        )

        return NextResponse.json(shelf, { status: 201 })
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return NextResponse.json(
                { error: "Game already in shelf" }, { status: 409 }
            )
        }

        console.error(error)
        return NextResponse.json(
            { error: "Something went wrong" }, { status: 500 }
        )
    }
}