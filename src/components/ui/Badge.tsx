import type { ReactNode } from 'react'
import type { ShelfStatus } from '@/generated/prisma/browser'
import { STATUS_META } from '@/constants/status'

type BadgeProps = {
    children: ReactNode
    className?: string
}

export function Badge({ children, className = 'border-line-strong bg-base/70 text-muted' }: BadgeProps) {
    return (
        <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium backdrop-blur-sm ${className}`}>
            {children}
        </span>
    )
}

export function StatusBadge({ status, className = '' }: { status: ShelfStatus; className?: string }) {
    return <Badge className={`${STATUS_META[status].badge} ${className}`}>{STATUS_META[status].label}</Badge>
}

function metacriticClass(score: number) {
    if (score >= 75) return 'border-emerald-400/50 bg-emerald-400/10 text-emerald-300'
    if (score >= 50) return 'border-amber-400/50 bg-amber-400/10 text-amber-300'
    return 'border-rose-400/50 bg-rose-400/10 text-rose-300'
}

export function MetacriticBadge({ score, label = false, className = '' }: { score: number; label?: boolean; className?: string }) {
    return (
        <Badge className={`${metacriticClass(score)} font-mono font-bold ${className}`}>
            {score}
            {label && <span className="font-sans font-medium opacity-80">Metacritic</span>}
        </Badge>
    )
}
