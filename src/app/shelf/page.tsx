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
        <div className="relative flex min-h-screen animate-fade-up flex-col items-center px-6 py-16 text-center">
            {/* Header */}
            <PageHeader />

            {/* Shelf Card */}
            <ShelfFilter shelf={shelf} />
        </div>
    )
}
