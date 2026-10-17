import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getSession } from "@/auth"
import { getUserLists } from "@/services/list.service"
import ListCard from "@/components/lists/ListCard"
import NewListForm from "@/components/lists/NewListForm"

export const metadata = { title: "My lists | GameShelf" }

export default async function ListsPage() {
    const session = await getSession()
    if (!session?.user?.id) redirect("/auth")

    const lists = await getUserLists(session.user.id)

    return (
        <div className="mx-auto flex max-w-6xl animate-fade-up flex-col gap-8 px-6 py-12">
            <Link href="/shelf" className="inline-flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-accent">
                <ArrowLeft className="h-4 w-4" /> Back to My Shelf
            </Link>

            <header className="space-y-2">
                <h1 className="font-display text-4xl font-bold uppercase tracking-wide md:text-5xl">Lists</h1>
                <p className="text-muted">Group games however you like: couch co-op, comfort games, the ones that made you cry.</p>
            </header>

            <NewListForm />

            {lists.length === 0 ? (
                <p className="rounded-lg border border-dashed border-line-strong py-16 text-center text-muted">No lists yet. Create your first one above.</p>
            ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {lists.map((list) => <ListCard key={list.id} list={list} href={`/shelf/lists/${list.id}`} />)}
                </div>
            )}
        </div>
    )
}
