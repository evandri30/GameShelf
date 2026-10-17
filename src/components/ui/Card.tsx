import type { HTMLAttributes, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={`rounded-lg border border-line bg-surface ${className}`} {...props} />
}

type SectionHeadingProps = {
    title: string
    icon?: LucideIcon
    description?: string
    action?: ReactNode
    as?: 'h1' | 'h2' | 'h3'
}

export function SectionHeading({ title, icon: Icon, description, action, as: Tag = 'h2' }: SectionHeadingProps) {
    return (
        <div className="flex items-end justify-between gap-4">
            <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                    {Icon && <Icon className="h-5 w-5 text-accent" aria-hidden />}
                    <Tag className="font-display text-xl font-semibold uppercase tracking-wide text-fg md:text-2xl">{title}</Tag>
                </div>
                {description && <p className="text-sm text-muted">{description}</p>}
            </div>
            {action}
        </div>
    )
}

export function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse rounded-md bg-surface-2 ${className}`} aria-hidden />
}
