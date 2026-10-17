import { getDashboardData } from '@/services/shelf.service'
import DashboardStats from '@/components/dashboard/DashboardStats'
import { notFound } from 'next/navigation'
import Image from 'next/image'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params
    const data = await getDashboardData(resolvedParams.id)
    if (!data) return { title: 'Not Found | GameShelf' }

    return {
        title: `${data.user.name || 'User'}'s Stats | GameShelf`,
        description: `View ${data.user.name || 'User'}'s top games and playing statistics.`,
    }
}

export default async function SharedDashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params
    const data = await getDashboardData(resolvedParams.id)

    if (!data) {
        return notFound()
    }

    const name = data.user.name || 'User'

    return (
        <div className="mx-auto flex max-w-6xl animate-fade-up flex-col gap-10 px-6 py-12">
            <div className="flex items-center gap-5">
                {data.user.image ? (
                    <Image
                        src={data.user.image}
                        alt={`${name}'s avatar`}
                        width={80}
                        height={80}
                        className="rounded-full border-2 border-accent object-cover"
                    />
                ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-accent bg-surface font-display text-3xl font-bold text-accent">
                        {name[0].toUpperCase()}
                    </div>
                )}

                <div className="space-y-1">
                    <h1 className="font-display text-3xl font-bold uppercase tracking-wide md:text-5xl">
                        {name}&apos;s Stats
                    </h1>
                    <p className="text-muted">Gaming journey & collection on GameShelf</p>
                </div>
            </div>

            <DashboardStats data={data} />
        </div>
    )
}
