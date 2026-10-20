import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { getSession } from '@/auth'
import { getCompletionsByMonth, getDashboardData, getReviewYears } from '@/services/shelf.service'
import DashboardStats from '@/components/dashboard/DashboardStats'
import CompletionChart, { MONTH_LABELS } from '@/components/dashboard/CompletionChart'
import ProfileCard from '@/components/dashboard/ProfileCard'
import ExportCard from '@/components/dashboard/ExportCard'
import { buttonClass } from '@/components/ui/Button'

export default async function DashboardPage() {
    const session = await getSession()

    if (!session?.user?.id) {
        redirect('/auth')
    }

    const [data, months, reviewYears] = await Promise.all([
        getDashboardData(session.user.id),
        getCompletionsByMonth(session.user.id),
        getReviewYears(session.user.id),
    ])

    if (!data) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center px-6 text-center">
                <p className="text-muted">Failed to load dashboard data.</p>
            </div>
        )
    }

    // newest year with a finished game, falling back to this year
    const reviewYear = reviewYears[0] ?? new Date().getUTCFullYear()

    return (
        <div className="mx-auto flex max-w-6xl animate-fade-up flex-col gap-10 px-6 py-12">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
                <div className="space-y-2">
                    <h1 className="font-display text-4xl font-bold uppercase tracking-wide md:text-5xl">Your Stats</h1>
                    <p className="text-muted">Your gaming journey, by the numbers.</p>
                </div>
                <Link href={`/dashboard/review/${reviewYear}`} className={buttonClass("primary", "md")}>
                    <Sparkles className="h-4 w-4" /> {reviewYear} in review
                </Link>
            </div>

            <DashboardStats data={data} />

            <CompletionChart
                title="Finished, last 12 months"
                buckets={months.map((m) => ({
                    // show the year under January so the timeline stays readable
                    label: m.month === 0 ? `${MONTH_LABELS[0]} '${String(m.year).slice(2)}` : MONTH_LABELS[m.month],
                    count: m.count,
                }))}
            />

            <ProfileCard username={data.user.username} isPublic={data.user.isPublic} />

            <ExportCard />
        </div>
    )
}
