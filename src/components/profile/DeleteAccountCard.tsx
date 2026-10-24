"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { signOut } from "next-auth/react"
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "react-toastify"
import { deleteAccount } from "@/app/profile/actions"
import { Card } from "@/components/ui/Card"
import Button from "@/components/ui/Button"

// Same native <dialog> approach as ConfirmDialog, with a password field the user must fill first
export default function DeleteAccountCard() {
    const [open, setOpen] = useState(false)
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()
    const ref = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        const dialog = ref.current
        if (!dialog) return
        if (open && !dialog.open) dialog.showModal()
        if (!open && dialog.open) dialog.close()
    }, [open])

    const close = () => {
        if (isPending) return
        setOpen(false)
        setPassword("")
        setError(null)
    }

    const submit = () => {
        startTransition(async () => {
            const result = await deleteAccount({ password })
            if (!result.ok) {
                setError(result.error)
                return
            }
            toast.success("Your account was deleted")
            await signOut({ callbackUrl: "/" })
        })
    }

    return (
        <Card className="border-status-dropped/30 p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                    <div className="rounded-md bg-status-dropped/15 p-2.5 text-status-dropped">
                        <Trash2 className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="font-display text-lg font-semibold uppercase tracking-wide">Delete account</h2>
                        <p className="max-w-md text-sm text-muted">
                            Permanently removes your shelf, lists and public profile. This can&apos;t be undone, so export your shelf first if you want to keep it.
                        </p>
                    </div>
                </div>
                <Button variant="danger" onClick={() => setOpen(true)}>Delete account</Button>
            </div>

            <dialog
                ref={ref}
                onCancel={(e) => {
                    e.preventDefault()
                    close()
                }}
                onClick={(e) => {
                    // click on the backdrop (the dialog element itself) closes it
                    if (e.target === e.currentTarget) close()
                }}
                className="m-auto w-[min(92vw,26rem)] rounded-lg border border-line-strong bg-surface p-0 text-left text-fg backdrop:bg-black/70 backdrop:backdrop-blur-sm open:animate-fade-up"
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        if (password) submit()
                    }}
                >
                    <div className="space-y-4 p-6">
                        <div className="space-y-2">
                            <h2 className="font-display text-lg font-semibold">Delete your account?</h2>
                            <p className="text-sm text-muted">
                                Every game, note, list and your public profile will be gone for good. Enter your password to confirm.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="delete-password" className="text-xs font-semibold uppercase tracking-wider text-muted">Password</label>
                            <input
                                id="delete-password"
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    setError(null)
                                }}
                                autoComplete="current-password"
                                maxLength={72}
                                autoFocus
                                aria-invalid={!!error}
                                aria-describedby={error ? "delete-password-error" : undefined}
                                className="h-10 w-full rounded-md border border-line-strong bg-surface-2 px-3 text-sm text-fg focus:border-accent focus:outline-none"
                            />
                            {error && <p id="delete-password-error" className="text-xs text-status-dropped">{error}</p>}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
                        <Button variant="ghost" onClick={close} disabled={isPending}>Cancel</Button>
                        <Button type="submit" variant="danger" disabled={!password || isPending}>
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete forever"}
                        </Button>
                    </div>
                </form>
            </dialog>
        </Card>
    )
}
