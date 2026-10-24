import Image from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, CalendarCheck, Clock, Gamepad2, Play, Star, Trophy } from "lucide-react"
import { getSession } from "@/auth"
import { getReviewYears, getYearInReview } from "@/services/shelf.service"
import { getCroppedImageUrl } from "@/utils/image"
import { getTimeZone } from "@/lib/timezone"
import { Card, SectionHeading } from "@/components/ui/Card"
import CompletionChart, { MONTH_LABELS } from "@/components/dashboard/CompletionChart"

type Props = { params: Promise<{ year: string }> }

export async function generateMetadata({ params }: Props) {
    const { year } = await params
    return { title: `${year} in Review | GameShelf` }
}

export default async function YearInReviewPage({ params }: Props) {
    const { year: yearParam } = await params
    if (!/^\d{4}$/.test(yearParam)) notFound()
    const year = Number(yearParam)

    const session = await getSession()
    if (!session?.user?.id) redirect("/auth")

    const tz = await getTimeZone()
    const [review, years] = await Promise.all([getYearInReview(session.user.id, year, tz), getReviewYears(session.user.id, tz)])

    const formatDate = (date: Date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: tz })

    const kpis = [
        { label: "Completed", value: review.completed.length, icon: CalendarCheck },
        { label: "Hours on them", value: review.hours, icon: Clock },
        { label: "Avg. rating", value: review.averageRating ? review.averageRating.toFixed(1) : "–", icon: Star },
        { label: "Started", value: review.started, icon: Play },
        { label: "Added to shelf", value: review.added, icon: Gamepad2 },
    ]

    return (
        <div className="mx-auto flex max-w-6xl animate-fade-up flex-col gap-10 px-6 py-12">
            <Link href="/dashboard" className="inline-flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-accent">
                <ArrowLeft className="h-4 w-4" /> Back to Stats
            </Link>

            <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <h1 className="font-display text-5xl font-bold uppercase leading-none tracking-tight md:text-7xl">
                    <span className="text-accent">{year}</span>
                    <br />
                    in review
                </h1>
                {years.length > 0 && (
                    <nav aria-label="Other years" className="flex flex-wrap gap-2">
                        {years.map((y) => (
                            <Link
                                key={y}
                                href={`/dashboard/review/${y}`}
                                aria-current={y === year ? "page" : undefined}
                                className={`rounded-md border px-3 py-1.5 font-mono text-sm transition-colors ${y === year ? "border-accent bg-accent text-accent-fg" : "border-line-strong text-muted hover:border-accent hover:text-accent"}`}
                            >
                                {y}
                            </Link>
                        ))}
                    </nav>
                )}
            </header>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                {kpis.map(({ label, value, icon: Icon }) => (
                    <Card key={label} className="p-5">
                        <div className="flex items-center justify-between text-muted">
                            <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
                            <Icon className="h-4 w-4 text-accent" aria-hidden />
                        </div>
                        <p className="mt-3 font-mono text-4xl font-bold text-fg">{value}</p>
                    </Card>
                ))}
            </div>

            <CompletionChart
                title={`Finished in ${year}`}
                buckets={review.months.map((m) => ({ label: MONTH_LABELS[m.month], count: m.count }))}
            />

            {review.favorites.length > 0 && (
                <section className="space-y-4">
                    <SectionHeading title={`Favorites of ${year}`} icon={Trophy} />
                    <div className="grid gap-5 md:grid-cols-3">
                        {review.favorites.map((game, i) => (
                            <Link key={game.id} href={`/shelf/${game.slug}`} className="group relative aspect-video overflow-hidden rounded-lg border border-line transition-[border-color,box-shadow] hover:border-accent/60 hover:shadow-glow">
                                {game.backgroundImage && (
                                    <Image src={getCroppedImageUrl(game.backgroundImage)} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                )}
                                <div className="absolute inset-0 bg-linear-to-t from-base via-base/40 to-transparent" />
                                <span className="absolute left-3 top-3 font-mono text-3xl font-bold text-accent drop-shadow">#{i + 1}</span>
                                <div className="absolute inset-x-0 bottom-0 p-4">
                                    <p className="font-display text-lg font-semibold text-fg">{game.title}</p>
                                    <p className="flex items-center gap-1 font-mono text-xs text-muted">
                                        <Star className="h-3.5 w-3.5 fill-accent text-accent" /> {game.rating}/5 · {game.playtime ?? 0}h
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <section className="space-y-4">
                <SectionHeading title="Everything you finished" icon={CalendarCheck} />
                {review.completed.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-line-strong py-12 text-center text-muted">
                        Nothing completed in {year} yet.
                    </p>
                ) : (
                    <ol className="divide-y divide-line rounded-lg border border-line bg-surface">
                        {review.completed.map((game) => (
                            <li key={game.id}>
                                <Link href={`/shelf/${game.slug}`} className="flex items-center gap-4 p-3 transition-colors hover:bg-surface-2">
                                    <span className="w-14 shrink-0 font-mono text-xs uppercase text-muted">{formatDate(game.completedAt!)}</span>
                                    <div className="relative aspect-video w-20 shrink-0 overflow-hidden rounded border border-line">
                                        {game.backgroundImage && <Image src={getCroppedImageUrl(game.backgroundImage, 200)} alt="" fill sizes="80px" className="object-cover" />}
                                    </div>
                                    <span className="flex-1 truncate font-medium text-fg">{game.title}</span>
                                    <span className="font-mono text-xs text-muted">{game.rating ? `${game.rating}/5` : "–"} · {game.playtime ?? 0}h</span>
                                </Link>
                            </li>
                        ))}
                    </ol>
                )}
            </section>
        </div>
    )
}
