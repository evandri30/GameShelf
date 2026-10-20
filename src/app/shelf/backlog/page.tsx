import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getSession } from "@/auth"
import { getBacklog } from "@/services/shelf.service"
import BacklogList from "@/components/shelf/BacklogList"
import RandomPick from "@/components/shelf/RandomPick"
import { buttonClass } from "@/components/ui/Button"

export const metadata = { title: "Up next | GameShelf" }

export default async function BacklogPage() {
    const session = await getSession()
    if (!session?.user?.id) redirect("/auth")

    const backlog = await getBacklog(session.user.id)

    return (
        <div className="mx-auto flex max-w-3xl animate-fade-up flex-col gap-8 px-6 py-12">
            <Link href="/shelf" className="inline-flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-accent">
                <ArrowLeft className="h-4 w-4" /> Back to My Shelf
            </Link>

            <header className="space-y-2">
                <h1 className="font-display text-4xl font-bold uppercase tracking-wide md:text-5xl">Up next</h1>
                <p className="text-muted">
                    Your planned games, in the order you want to play them. Drag to reorder, or use the arrows.
                </p>
            </header>

            {backlog.length === 0 ? (
                <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-line-strong py-16 text-center">
                    <p className="text-muted">No planned games yet.</p>
                    <Link href="/games" className={buttonClass("secondary", "sm")}>Find something to play</Link>
                </div>
            ) : (
                <>
                    {backlog.length > 1 && <RandomPick items={backlog} />}
                    <BacklogList items={backlog} />
                </>
            )}
        </div>
    )
}
