'use client';

import Link from "next/link";
import { signOut } from "next-auth/react";
import { toast } from "react-toastify";
import { useState, useRef, useEffect } from "react";

export default function UserMenu({ name }: { name: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent | TouchEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handler)
        document.addEventListener("touchstart", handler)

        return () => {
            document.removeEventListener("mousedown", handler)
            document.removeEventListener("touchstart", handler)
        }
    }, [])

    const itemClass = "block w-full px-4 py-2 text-left text-sm text-fg transition-colors hover:bg-surface-2 cursor-pointer"

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-label="Open user menu"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-surface-2 font-display text-sm font-bold uppercase text-accent transition-colors hover:border-accent"
            >
                {name[0]}
            </button>

            <div
                role="menu"
                className={`absolute right-0 mt-2 w-44 overflow-hidden rounded-md border border-line bg-surface shadow-xl shadow-black/50 transition-all duration-150
                ${isOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"}`}
            >
                <p className="truncate border-b border-line px-4 py-2 text-xs text-muted">{name}</p>
                <Link href="/dashboard" role="menuitem" className={itemClass} onClick={() => setIsOpen(false)}>
                    Dashboard
                </Link>
                <Link href="/shelf" role="menuitem" className={itemClass} onClick={() => setIsOpen(false)}>
                    Shelf
                </Link>
                <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                        setIsOpen(false)
                        toast.success("Logged out successfully")
                        signOut({ callbackUrl: "/" })
                    }}
                    className={`${itemClass} border-t border-line`}
                >
                    Logout
                </button>
            </div>
        </div>
    )
}
