import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getSession } from "@/auth"
import { getPublicProfile } from "@/services/user.service"
import { getUserList } from "@/services/list.service"
import PublicGameCard from "@/components/profile/PublicGameCard"

type Props = { params: Promise<{ username: string; listId: string }> }

export default async function PublicListPage({ params }: Props) {
    const { username, listId } = await params
    const [profile, session] = await Promise.all([getPublicProfile(username), getSession()])

    if (!profile || (!profile.isPublic && session?.user?.id !== profile.id)) notFound()

    const list = await getUserList(profile.id, listId)
    if (!list) notFound()

    return (
        <div className="mx-auto flex max-w-6xl animate-fade-up flex-col gap-8 px-6 py-12">
            <Link href={`/u/${profile.username}`} className="inline-flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-accent">
                <ArrowLeft className="h-4 w-4" /> @{profile.username}
            </Link>

            <header className="space-y-2">
                <h1 className="font-display text-4xl font-bold uppercase tracking-wide md:text-5xl">{list.name}</h1>
                {list.description && <p className="max-w-2xl text-muted">{list.description}</p>}
                <p className="font-mono text-sm text-subtle">{list.items.length} {list.items.length === 1 ? "game" : "games"} · by {profile.name || profile.username}</p>
            </header>

            {list.items.length === 0 ? (
                <p className="rounded-lg border border-dashed border-line-strong py-16 text-center text-muted">This list is empty.</p>
            ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {list.items.map(({ shelf }) => <PublicGameCard key={shelf.id} game={shelf} />)}
                </div>
            )}
        </div>
    )
}
