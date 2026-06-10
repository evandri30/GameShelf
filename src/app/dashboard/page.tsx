import { auth } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { getDashboardData } from '@/services/shelf.service'
import { FadeIn } from '@/components/AnimatedSection'
import DashboardStats from '@/components/dashboard/DashboardStats'
import ShareButton from '@/components/dashboard/ShareButton'
import { ShelfStatus } from '@prisma/client'

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/auth')
    }

    const data = await getDashboardData(session.user.id)

    if (!data) {
        return (
            <main className="relative min-h-screen px-6 py-16 flex flex-col items-center justify-center text-center">
                <p className="text-white/60">Failed to load dashboard data.</p>
            </main>
        )
    }

    return (
        <FadeIn>
            <main className="relative min-h-screen overflow-hidden px-6 py-16 flex flex-col items-center">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_60%)]" />

                <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-16 px-4 md:px-0">
                    <div className="text-left space-y-2 lg:space-y-4">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-white via-white/90 to-white/60 tracking-tight">Your Dashboard</h1>
                        <p className="text-lg text-zinc-400  font-medium">Overview of your gaming journey</p>
                    </div>
                    <ShareButton userId={session.user.id} />
                </div>

                <DashboardStats
                    stats={data.stats as Record<ShelfStatus, { count: number; playtime: number; rating: number }>}
                    totalGames={data.totalGames}
                    topGames={data.topGames}
                />
            </main>
        </FadeIn>
    )
}
