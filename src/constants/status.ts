import type { ShelfStatus } from '@/generated/prisma/browser'

export const SHELF_STATUSES = ['PLANNED', 'PLAYING', 'COMPLETED', 'DROPPED'] as const satisfies readonly ShelfStatus[]

type StatusMeta = {
    label: string
    // raw color, for charts and inline styles
    color: string
    // tailwind classes for badges
    badge: string
}

// Single source of truth for status labels and colors (badges, filters, charts)
export const STATUS_META: Record<ShelfStatus, StatusMeta> = {
    PLANNED: {
        label: 'Planned',
        color: 'var(--color-status-planned)',
        badge: 'border-status-planned/40 bg-status-planned/10 text-status-planned',
    },
    PLAYING: {
        label: 'Playing',
        color: 'var(--color-status-playing)',
        badge: 'border-status-playing/40 bg-status-playing/10 text-status-playing',
    },
    COMPLETED: {
        label: 'Completed',
        color: 'var(--color-status-completed)',
        badge: 'border-status-completed/40 bg-status-completed/10 text-status-completed',
    },
    DROPPED: {
        label: 'Dropped',
        color: 'var(--color-status-dropped)',
        badge: 'border-status-dropped/40 bg-status-dropped/10 text-status-dropped',
    },
}

export function isShelfStatus(value: string): value is ShelfStatus {
    return (SHELF_STATUSES as readonly string[]).includes(value)
}
