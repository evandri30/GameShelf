import { getSession } from '@/auth'
import { getUserBySlug } from '@/services/shelf.service'
import { notFound, redirect } from 'next/navigation'
import ShelfDetail from '@/components/shelf/ShelfDetail'
import Backdrop from '@/components/Backdrop'
import AddToListMenu from '@/components/lists/AddToListMenu'
import { getListMembership } from '@/services/list.service'
import { getTimeZone } from '@/lib/timezone'
import type { Metadata } from 'next'

type Props = {
    params: Promise<{ slug: string }>
}

// Generate metadata untuk SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const session = await getSession()

    if (!session?.user?.id) {
        return {
            title: 'Unauthorized'
        }
    }

    const shelf = await getUserBySlug(session.user.id, slug)

    if (!shelf) {
        return {
            title: 'Not Found'
        }
    }

    return {
        title: `${shelf.title} - My Game Shelf`,
        description: shelf.caption || `${shelf.title} - Status: ${shelf.status}`,
        openGraph: {
            title: shelf.title,
            description: shelf.caption || `Status: ${shelf.status}`,
            images: shelf.backgroundImage ? [shelf.backgroundImage] : []
        }
    }
}

export default async function ShelfDetailPage({ params }: Props) {
    const { slug } = await params
    const session = await getSession()

    if (!session?.user?.id) {
        redirect('/auth')
    }

    const shelf = await getUserBySlug(session.user.id, slug)

    if (!shelf) {
        notFound()
    }

    const [lists, timeZone] = await Promise.all([getListMembership(session.user.id, shelf.id), getTimeZone()])

    return (
        <div className="relative isolate -mt-16 animate-fade-up pt-16">
            <Backdrop src={shelf.backgroundImage} />
            <ShelfDetail shelf={shelf} timeZone={timeZone} listsSlot={<AddToListMenu shelfId={shelf.id} lists={lists} />} />
        </div>
    )
}
