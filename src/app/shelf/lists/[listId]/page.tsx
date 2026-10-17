import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getSession } from "@/auth"
import { getUserList } from "@/services/list.service"
import ListEditor from "@/components/lists/ListEditor"

type Props = { params: Promise<{ listId: string }> }

export default async function ListPage({ params }: Props) {
    const { listId } = await params
    const session = await getSession()
    if (!session?.user?.id) redirect("/auth")

    const list = await getUserList(session.user.id, listId)
    if (!list) notFound()

    return (
        <div className="mx-auto flex max-w-6xl animate-fade-up flex-col gap-8 px-6 py-12">
            <Link href="/shelf/lists" className="inline-flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-accent">
                <ArrowLeft className="h-4 w-4" /> All lists
            </Link>

            <ListEditor
                // remount when the server sends a renamed list so the form starts from the saved values
                key={`${list.name}|${list.description}`}
                list={{ id: list.id, name: list.name, description: list.description }}
                games={list.items.map((i) => i.shelf)}
            />
        </div>
    )
}
