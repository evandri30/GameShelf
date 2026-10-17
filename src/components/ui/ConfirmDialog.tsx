'use client'

import { useEffect, useRef } from 'react'
import Button from './Button'

type ConfirmDialogProps = {
    open: boolean
    title: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void
    onCancel: () => void
}

// Native <dialog>: focus trap, Esc to close and backdrop for free, no extra dependency
export default function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const ref = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        const dialog = ref.current
        if (!dialog) return
        if (open && !dialog.open) dialog.showModal()
        if (!open && dialog.open) dialog.close()
    }, [open])

    return (
        <dialog
            ref={ref}
            onCancel={(e) => {
                e.preventDefault()
                onCancel()
            }}
            onClick={(e) => {
                // click on the backdrop (the dialog element itself) closes it
                if (e.target === e.currentTarget) onCancel()
            }}
            className="m-auto w-[min(92vw,24rem)] rounded-lg text-left border border-line-strong bg-surface p-0 text-fg backdrop:bg-black/70 backdrop:backdrop-blur-sm open:animate-fade-up"
        >
            <div className="space-y-2 p-6">
                <h2 className="font-display text-lg font-semibold">{title}</h2>
                {description && <p className="text-sm text-muted">{description}</p>}
            </div>
            <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
                <Button variant="ghost" onClick={onCancel}>
                    {cancelLabel}
                </Button>
                <Button variant="danger" onClick={onConfirm} autoFocus>
                    {confirmLabel}
                </Button>
            </div>
        </dialog>
    )
}
