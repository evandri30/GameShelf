import { getDashboardData } from '@/services/shelf.service'
import DashboardStats from '@/components/dashboard/DashboardStats'
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
        <div className="relative flex min-h-screen animate-fade-up flex-col items-center px-6 py-16">
            <div className="mx-auto mb-16 flex w-full max-w-5xl flex-col items-center gap-6 text-center">
                {user.image ? (
                    <Image
                        src={user.image}
                        alt={`${user.name}'s avatar`}
                        width={120}
                        height={120}
                        className="rounded-full border-4 border-line object-cover shadow-xl"
                    />
                ) : (
                    <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full border-4 border-line bg-surface font-display text-5xl font-bold text-accent shadow-xl">
                        {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                )}

                <div className="space-y-2 lg:space-y-3">
                    <h1 className="font-display text-4xl font-bold uppercase tracking-wide text-fg md:text-5xl">
                        {user.name || 'User'}&apos;s Dashboard
                    </h1>
                    <p className="text-lg font-medium text-muted">Gaming Journey & Collection</p>
                </div>
            </div>

            <DashboardStats stats={stats} totalGames={totalGames} topGames={topGames} />
        </div>
    )
}
