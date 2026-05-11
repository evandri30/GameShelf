import { auth } from '@/app/api/auth/[...nextauth]/route'
import { FadeIn } from '@/components/AnimatedSection'
import { getUserShelf } from '@/services/shelf.service'
import PageHeader from '@/components/shelf/PageHeader'
import ShelfFilter from '@/components/shelf/ShelfFilter'
import { redirect } from 'next/navigation'

export default async function ShelfPage() {
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/auth')
    }

    const shelf = await getUserShelf(session.user.id)

    return (
        <FadeIn>
            <main className="relative min-h-screen overflow-hidden px-6 py-16 flex flex-col items-center text-center">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_60%)]" />

                {/* Header */}
                <PageHeader />

                {/* Shelf Card */}
                <ShelfFilter shelf={shelf} />
            </main>
        </FadeIn>
    )
}