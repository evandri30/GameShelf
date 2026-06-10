import { getDashboardData } from '@/services/shelf.service'
import { FadeIn } from '@/components/AnimatedSection'
import DashboardStats from '@/components/dashboard/DashboardStats'
import { ShelfStatus, Shelf } from '@prisma/client'
import { notFound } from 'next/navigation'
import Image from 'next/image'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params
    const data = await getDashboardData(resolvedParams.id)
    if (!data) return { title: 'Not Found | GameShelf' }

    return {
        title: `${data.user.name || 'User'}'s Dashboard | GameShelf`,
        description: `View ${data.user.name || 'User'}'s top games and playing statistics.`,
    }
}

export default async function SharedDashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params
    const data = await getDashboardData(resolvedParams.id)

    if (!data) {
        return notFound()
    }

    const { user, stats, totalGames, topGames } = data

    return (
        <FadeIn>
            <main className="relative min-h-screen overflow-hidden px-6 py-16 flex flex-col items-center">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_60%)]" />

                <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center gap-6 mb-16">
                    {user.image ? (
                        <Image
                            src={user.image}
                            alt={`${user.name}'s avatar`}
                            width={120}
                            height={120}
                            className="rounded-full border-4 border-zinc-800 shadow-xl object-cover"
                        />
                    ) : (
                        <div className="w-[120px] h-[120px] rounded-full border-4 border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-400 text-5xl font-bold shadow-xl">
                            {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                    )}

                    <div className="space-y-2 lg:space-y-3">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-white via-white/90 to-white/60 tracking-tight">
                            {user.name || 'User'}&apos;s Dashboard
                        </h1>
                        <p className="text-lg text-zinc-400 font-medium">Gaming Journey & Collection</p>
                    </div>
                </div>

                <DashboardStats
                    stats={stats as Record<ShelfStatus, { count: number; playtime: number; rating: number }>}
                    totalGames={totalGames}
                    topGames={topGames as Shelf[]}
                />
            </main>
        </FadeIn>
    )
}
