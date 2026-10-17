import { getSession } from '@/auth'
import { getUserShelf } from '@/services/shelf.service'
import PageHeader from '@/components/shelf/PageHeader'
import ShelfFilter from '@/components/shelf/ShelfFilter'
import { redirect } from 'next/navigation'

export default async function ShelfPage() {
    const session = await getSession()

    if (!session?.user?.id) {
        redirect('/auth')
    }

    const shelf = await getUserShelf(session.user.id)

    return (
        <div className="mx-auto flex max-w-7xl animate-fade-up flex-col gap-8 px-6 py-12">
            <PageHeader total={shelf.length} />
            <ShelfFilter shelf={shelf} />
        </div>
    )
}
