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
            <div className="flex min-h-[60vh] items-center justify-center px-6 text-center">
                <p className="text-muted">Failed to load dashboard data.</p>
            </div>
        )
    }

    return (
        <div className="mx-auto flex max-w-6xl animate-fade-up flex-col gap-10 px-6 py-12">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
                <div className="space-y-2">
                    <h1 className="font-display text-4xl font-bold uppercase tracking-wide md:text-5xl">Your Stats</h1>
                    <p className="text-muted">Your gaming journey, by the numbers.</p>
                </div>
                <ShareButton userId={session.user.id} />
            </div>

            <DashboardStats data={data} />
        </div>
    )
}
