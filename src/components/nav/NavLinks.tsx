'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Compass, Library } from 'lucide-react'

const NAV_ITEMS = [
    { href: '/games', label: 'Discover', icon: Compass },
    { href: '/shelf', label: 'My Shelf', icon: Library },
    { href: '/dashboard', label: 'Stats', icon: BarChart3 },
]

function useIsActive() {
    const pathname = usePathname()
    return (href: string) => pathname === href || pathname.startsWith(`${href}/`)
}

export function NavLinks() {
    const isActive = useIsActive()

    return (
        <ul className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map(({ href, label }) => {
                const active = isActive(href)
                return (
                    <li key={href}>
                        <Link
                            href={href}
                            aria-current={active ? 'page' : undefined}
                            className={`relative rounded-md px-3 py-2 font-display text-sm font-semibold uppercase tracking-wider transition-colors ${active ? 'text-accent' : 'text-muted hover:text-fg'}`}
                        >
                            {label}
                            {active && <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-accent" aria-hidden />}
                        </Link>
                    </li>
                )
            })}
        </ul>
    )
}

// Fixed bottom bar on small screens; the spacer keeps the footer from hiding behind it
export function MobileTabBar() {
    const isActive = useIsActive()

    return (
        <>
            <div className="h-16 md:hidden" aria-hidden />
            <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-base/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
                <ul className="grid h-16 grid-cols-3">
                    {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                        const active = isActive(href)
                        return (
                            <li key={href}>
                                <Link
                                    href={href}
                                    aria-current={active ? 'page' : undefined}
                                    className={`flex h-full flex-col items-center justify-center gap-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${active ? 'text-accent' : 'text-muted'}`}
                                >
                                    <Icon className="h-5 w-5" aria-hidden />
                                    {label}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>
        </>
    )
}
