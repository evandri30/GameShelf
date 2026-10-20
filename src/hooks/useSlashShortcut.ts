"use client"

import { useEffect, type RefObject } from "react"

// Pressing "/" anywhere outside a text field focuses the given input, like GitHub or YouTube
export function useSlashShortcut(ref: RefObject<HTMLInputElement | null>) {
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return
            const target = e.target as HTMLElement | null
            if (target?.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "")) return

            e.preventDefault()
            ref.current?.focus()
            ref.current?.select()
        }

        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [ref])
}
