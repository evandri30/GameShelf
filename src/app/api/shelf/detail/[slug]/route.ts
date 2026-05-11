import { auth } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'
import { getUserBySlug } from "@/services/shelf.service"

type Params = {
    params: Promise<{ slug: string }>
}

export async function GET(req: Request, { params }: Params) {
    const { slug } = await params
    const session = await auth()

    if (!session?.user?.id) {
        return new Response("Unauthorized", { status: 401 })
    }

    try {
        const shelf = await getUserBySlug(session.user.id, slug)

        if (!shelf) {
            return new Response("Not Found", { status: 404 })
        }

        return NextResponse.json(shelf)
    } catch (error) {
        console.error(error)
        return new Response("Internal Server Error", { status: 500 })
    }
} 