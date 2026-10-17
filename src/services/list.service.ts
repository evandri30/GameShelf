import { prisma } from '@/lib/prisma'

// List overview: name, size and a few covers for the preview mosaic
export async function getUserLists(userId: string) {
    return prisma.shelfList.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        select: {
            id: true,
            name: true,
            description: true,
            _count: { select: { items: true } },
            items: { take: 4, orderBy: { addedAt: 'desc' }, select: { shelf: { select: { backgroundImage: true } } } }
        }
    })
}

export async function getUserList(userId: string, listId: string) {
    return prisma.shelfList.findFirst({
        where: { id: listId, userId },
        select: {
            id: true,
            name: true,
            description: true,
            items: {
                orderBy: { addedAt: 'desc' },
                select: {
                    shelf: { select: { id: true, title: true, slug: true, status: true, backgroundImage: true, rating: true, playtime: true } }
                }
            }
        }
    })
}

// Every list of the user, flagged with whether the given shelf game is in it (for the "Add to list" menu)
export async function getListMembership(userId: string, shelfId: string) {
    const lists = await prisma.shelfList.findMany({
        where: { userId },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, items: { where: { shelfId }, select: { shelfId: true } } }
    })
    return lists.map(({ items, ...list }) => ({ ...list, hasGame: items.length > 0 }))
}

export async function createUserList(userId: string, name: string, description: string | null) {
    return prisma.shelfList.create({ data: { userId, name, description }, select: { id: true } })
}

export async function updateUserList(userId: string, listId: string, data: { name?: string; description?: string | null }) {
    return prisma.shelfList.update({ where: { id: listId, userId }, data })
}

export async function deleteUserList(userId: string, listId: string) {
    return prisma.shelfList.delete({ where: { id: listId, userId } })
}

export async function setListMembership(userId: string, listId: string, shelfId: string, member: boolean) {
    // both the list and the game must belong to the user
    const [list, shelf] = await Promise.all([
        prisma.shelfList.findFirst({ where: { id: listId, userId }, select: { id: true } }),
        prisma.shelf.findFirst({ where: { id: shelfId, userId }, select: { id: true } }),
    ])
    if (!list || !shelf) return false

    if (member) {
        await prisma.shelfListItem.upsert({
            where: { listId_shelfId: { listId, shelfId } },
            create: { listId, shelfId },
            update: {},
        })
    } else {
        await prisma.shelfListItem.deleteMany({ where: { listId, shelfId } })
    }
    // bump updatedAt so recently touched lists sort first
    await prisma.shelfList.update({ where: { id: listId }, data: { updatedAt: new Date() } })
    return true
}
