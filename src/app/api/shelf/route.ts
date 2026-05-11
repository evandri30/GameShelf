import { auth } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'
import { createUserShelf } from '@/services/shelf.service'
import { CreateShelfSchema } from "@/schemas/shelf.schema"

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return new Response("Unauthorized", { status: 401 })
    }

    const body = await req.json()

    const result = CreateShelfSchema.safeParse(body)

    if (!result.success) {
        return NextResponse.json(
            { error: "Invalid Input" }, { status: 400 }
        )
    }

    const { rawgId, title, slug, backgroundImage } = result.data

    const shelf = await createUserShelf(
        session.user.id,
        rawgId,
        title,
        slug,
        backgroundImage
    )

    return NextResponse.json(shelf)
}