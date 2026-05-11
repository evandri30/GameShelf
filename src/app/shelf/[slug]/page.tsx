import { auth } from '@/app/api/auth/[...nextauth]/route'
import { getUserBySlug } from '@/services/shelf.service'
import { notFound, redirect } from 'next/navigation'
import { FadeIn } from '@/components/AnimatedSection'
import ShelfDetail from '@/components/shelf/ShelfDetail'
import type { Metadata } from 'next'

type Props = {
    params: Promise<{ slug: string }>
}

// Generate metadata untuk SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const session = await auth()

    if (!session?.user?.id) {
        return {
            title: 'Unauthorized'
        }
    }

    const shelf = await getUserBySlug(session.user.id, slug)

    if (!shelf) {
        return {
            title: 'Not Found'
        }
    }

    return {
        title: `${shelf.title} - My Game Shelf`,
        description: shelf.caption || `${shelf.title} - Status: ${shelf.status}`,
        openGraph: {
            title: shelf.title,
            description: shelf.caption || `Status: ${shelf.status}`,
            images: shelf.backgroundImage ? [shelf.backgroundImage] : []
        }
    }
}

export default async function ShelfDetailPage({ params }: Props) {
    const { slug } = await params
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/auth')
    }

    const shelf = await getUserBySlug(session.user.id, slug)

    if (!shelf) {
        notFound()
    }

    return (
        <FadeIn>
            <main className="relative min-h-screen overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_60%)]" />

                <ShelfDetail shelf={shelf} />
            </main>
        </FadeIn>
    )
}