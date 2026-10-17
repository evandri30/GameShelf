import { getSession } from '@/auth'
import { redirect } from 'next/navigation'
import { getDashboardData } from '@/services/shelf.service'
import DashboardStats from '@/components/dashboard/DashboardStats'
import ShareButton from '@/components/dashboard/ShareButton'

export default async function DashboardPage() {
    const session = await getSession()

    if (!session?.user?.id) {
        redirect('/auth')
    }

    const data = await getDashboardData(session.user.id)

    if (!data) {
        return (
            <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
                <p className="text-muted">Failed to load dashboard data.</p>
            </div>
        )
    }

    return (
        <div className="relative flex min-h-screen animate-fade-up flex-col items-center px-6 py-16">
            <div className="mx-auto mb-16 flex w-full max-w-5xl flex-col items-start justify-between gap-6 md:flex-row md:items-end">
                <div className="space-y-2 text-left lg:space-y-4">
                    <h1 className="font-display text-4xl font-bold uppercase tracking-wide text-fg md:text-5xl lg:text-6xl">Your Dashboard</h1>
                    <p className="text-lg font-medium text-muted">Overview of your gaming journey</p>
                </div>
                <ShareButton userId={session.user.id} />
            </div>

            <DashboardStats stats={data.stats} totalGames={data.totalGames} topGames={data.topGames} />
        </div>
    )
}
