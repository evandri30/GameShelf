import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

// Old share links used the user id; public profiles now live at /u/<username>
export default async function LegacySharePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const user = await prisma.user.findUnique({ where: { id }, select: { username: true, isPublic: true } })

    if (!user?.isPublic) notFound()
    redirect(`/u/${user.username}`)
}
