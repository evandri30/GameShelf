import { getSession } from '@/auth'
import { getBacklog, getUserShelf } from '@/services/shelf.service'
import PageHeader from '@/components/shelf/PageHeader'
import ShelfFilter from '@/components/shelf/ShelfFilter'
import UpNext from '@/components/shelf/UpNext'
import { redirect } from 'next/navigation'

export const metadata = { title: "My shelf | GameShelf" }

export default async function ShelfPage() {
    const session = await getSession()

    if (!session?.user?.id) {
        redirect('/auth')
    }

    const [shelf, backlog] = await Promise.all([getUserShelf(session.user.id), getBacklog(session.user.id)])

    return (
        <div className="mx-auto flex max-w-7xl animate-fade-up flex-col gap-8 px-6 py-12">
            <PageHeader total={shelf.length} />
            <UpNext items={backlog.slice(0, 3)} total={backlog.length} />
            <ShelfFilter shelf={shelf} />
        </div>
    )
}
