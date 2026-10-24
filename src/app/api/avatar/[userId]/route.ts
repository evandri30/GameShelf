import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getAvatar } from "@/services/user.service"

// GET /api/avatar/<userId> serves an uploaded profile picture.
// Private profiles stay invisible here too, except to their owner.
export async function GET(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params
    const avatar = await getAvatar(userId)

    const isPublic = !!avatar?.user.isPublic
    const isOwner = !isPublic && !!avatar && (await auth())?.user?.id === userId
    if (!avatar || (!isPublic && !isOwner)) {
        return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return new Response(avatar.data, {
        headers: {
            "Content-Type": avatar.mimeType,
            // links carry ?v=<upload time>, so a public avatar never changes under the same URL
            "Cache-Control": isPublic ? "public, max-age=31536000, immutable" : "private, no-cache",
            "X-Content-Type-Options": "nosniff",
        },
    })
}
