import { auth } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'
import { editUserShelf, deleteUserShelf } from '@/services/shelf.service'
import { UpdateShelfSchema } from "@/schemas/shelf.schema"

type Params = {
    params: Promise<{ id: string }>
}

export async function PATCH(req: Request, { params }: Params) {
    const { id } = await params;
    const session = await auth()

    if (!session?.user?.id) {
        return new Response("Unauthorized", { status: 401 })
    }

    const body = await req.json()

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
        console.error(error)
        return new Response("Not found or not allowed", { status: 404 })
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
        console.error(error)
        return new Response("Not found or not allowed", { status: 404 })
    }
}