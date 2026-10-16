import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { editUserShelf, deleteUserShelf } from '@/services/shelf.service'
import { UpdateShelfSchema } from "@/schemas/shelf.schema"
import { Prisma } from '@/generated/prisma/client'

type Params = {
    params: Promise<{ id: string }>
}

function handleShelfError(error: unknown) {
    // P2025: no shelf with this id belonging to the user
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        return new Response("Not found or not allowed", { status: 404 })
    }

    console.error(error)
    return new Response("Internal Server Error", { status: 500 })
}

export async function PATCH(req: Request, { params }: Params) {
    const { id } = await params;
    const session = await auth()

    if (!session?.user?.id) {
        return new Response("Unauthorized", { status: 401 })
    }

    const body = await req.json().catch(() => null)

    const result = UpdateShelfSchema.safeParse(body)

    if (!result.success) {
        return NextResponse.json(
            { message: "Invalid Input" }, { status: 400 }
        )
    }

    try {
        const updated = await editUserShelf(id, session.user.id, result.data)
        return NextResponse.json(updated)
    } catch (error) {
        return handleShelfError(error)
    }
}

export async function DELETE(req: Request, { params }: Params) {
    const { id } = await params
    const session = await auth()

    if (!session?.user?.id) {
        return new Response("Unauthorized", { status: 401 })
    }

    try {
        await deleteUserShelf(id, session.user.id)

        return new Response("Deleted", { status: 200 })
    } catch (error) {
        return handleShelfError(error)
    }
}