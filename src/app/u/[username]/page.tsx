import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Library, ListChecks, Lock } from "lucide-react"
import { getSession } from "@/auth"
import { getPublicProfile } from "@/services/user.service"
import { getDashboardData } from "@/services/shelf.service"
import { STATUS_META } from "@/constants/status"
import DashboardStats from "@/components/dashboard/DashboardStats"
import PublicGameCard from "@/components/profile/PublicGameCard"
import ListCard from "@/components/lists/ListCard"
import { SectionHeading } from "@/components/ui/Card"

type Props = { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { username } = await params
    const profile = await getPublicProfile(username)
    if (!profile?.isPublic) return { title: "Profile not found | GameShelf" }

    const name = profile.name || profile.username
    const description = `${name} has ${profile.shelves.length} games on GameShelf. See what they're playing, what they finished and their favorites.`
    return {
        title: `${name} (@${profile.username}) | GameShelf`,
        description,
        openGraph: { title: `${name} on GameShelf`, description },
    }
}

export default async function ProfilePage({ params }: Props) {
    const { username } = await params
    const [profile, session] = await Promise.all([getPublicProfile(username), getSession()])

    const isOwner = !!profile && session?.user?.id === profile.id
    // private profiles look exactly like missing ones to everyone but the owner
    if (!profile || (!profile.isPublic && !isOwner)) notFound()

    const stats = await getDashboardData(profile.id)
    if (!stats) notFound()

    const name = profile.name || profile.username
    const memberSince = profile.createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })

    return (
        <div className="mx-auto flex max-w-6xl animate-fade-up flex-col gap-12 px-6 py-12">
            {!profile.isPublic && (
                <p className="flex items-center gap-2 rounded-md border border-status-planned/40 bg-status-planned/10 px-4 py-3 text-sm text-status-planned">
                    <Lock className="h-4 w-4 shrink-0" />
                    Only you can see this page. Turn on your public profile on the <Link href="/profile" className="underline">Profile page</Link> to share it.
                </p>
            )}

            <header className="flex items-center gap-5">
                {profile.image ? (
                    <Image src={profile.image} alt="" width={88} height={88} unoptimized className="rounded-full border-2 border-accent object-cover" />
                ) : (
                    <div className="flex h-22 w-22 shrink-0 items-center justify-center rounded-full border-2 border-accent bg-surface font-display text-4xl font-bold text-accent">
                        {name[0].toUpperCase()}
                    </div>
                )}
                <div className="min-w-0 space-y-1">
                    <h1 className="truncate font-display text-3xl font-bold uppercase tracking-wide md:text-5xl">{name}</h1>
                    <p className="font-mono text-sm text-muted">@{profile.username} · on GameShelf since {memberSince}</p>
                </div>
            </header>

            <DashboardStats data={stats} />

            {profile.lists.length > 0 && (
                <section className="space-y-5">
                    <SectionHeading title="Lists" icon={ListChecks} />
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {profile.lists.map((list) => (
                            <ListCard key={list.id} list={list} href={`/u/${profile.username}/lists/${list.id}`} />
                        ))}
                    </div>
                </section>
            )}

            <section className="space-y-8">
                <SectionHeading title="Shelf" icon={Library} />
                {profile.shelves.length === 0 && <p className="text-muted">Nothing on the shelf yet.</p>}
                {/* playing first: it's what visitors care about most */}
                {(["PLAYING", "COMPLETED", "PLANNED", "DROPPED"] as const).map((status) => {
                    const games = profile.shelves.filter((g) => g.status === status)
                    if (!games.length) return null
                    return (
                        <div key={status} className="space-y-3">
                            <h3 className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider text-muted">
                                <span className="h-2 w-2 rounded-full" style={{ background: STATUS_META[status].color }} />
                                {STATUS_META[status].label}
                                <span className="font-mono text-xs text-subtle">{games.length}</span>
                            </h3>
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                                {games.map((game) => <PublicGameCard key={game.id} game={game} />)}
                            </div>
                        </div>
                    )
                })}
            </section>
        </div>
    )
}
