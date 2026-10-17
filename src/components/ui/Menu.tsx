'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type MenuProps = {
    label: string
    trigger: ReactNode
    triggerClassName?: string
    align?: 'left' | 'right'
    // children get a close() so items can dismiss the menu after acting
    children: (close: () => void) => ReactNode
}

// Small dropdown: closes on outside click, Escape, or when an item calls close()
export default function Menu({ label, trigger, triggerClassName = '', align = 'right', children }: MenuProps) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return

        const onPointer = (e: MouseEvent | TouchEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false)
        }

        document.addEventListener('mousedown', onPointer)
        document.addEventListener('touchstart', onPointer)
        document.addEventListener('keydown', onKey)
        return () => {
            document.removeEventListener('mousedown', onPointer)
            document.removeEventListener('touchstart', onPointer)
            document.removeEventListener('keydown', onKey)
        }
    }, [open])

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                aria-label={label}
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
                className={`cursor-pointer ${triggerClassName}`}
            >
                {trigger}
            </button>

            {open && (
                <div
                    role="menu"
                    className={`absolute z-40 mt-2 min-w-44 animate-fade-in overflow-hidden rounded-md border border-line-strong bg-surface py-1 text-left shadow-xl shadow-black/60 ${align === 'right' ? 'right-0' : 'left-0'}`}
                >
                    {children(() => setOpen(false))}
                </div>
            )}
        </div>
    )
}

export const menuItemClass =
    'flex w-full cursor-pointer items-center gap-2 whitespace-nowrap px-4 py-2 text-left text-sm text-fg transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50'

export function MenuLabel({ children }: { children: ReactNode }) {
    return <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-subtle">{children}</p>
}

export function MenuDivider() {
    return <div className="my-1 border-t border-line" />
}
