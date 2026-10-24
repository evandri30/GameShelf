"use client"

import { useState, useTransition } from "react"
import { KeyRound, Loader2 } from "lucide-react"
import { toast } from "react-toastify"
import { changePassword } from "@/app/dashboard/actions"
import { Card } from "@/components/ui/Card"
import Button from "@/components/ui/Button"

const EMPTY = { currentPassword: "", newPassword: "", confirm: "" }

const inputClass =
    "h-10 w-full rounded-md border border-line-strong bg-surface-2 px-3 text-sm text-fg focus:border-accent focus:outline-none aria-[invalid=true]:border-status-dropped"

export default function ChangePasswordCard() {
    const [form, setForm] = useState(EMPTY)
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const mismatch = form.confirm !== "" && form.confirm !== form.newPassword
    const canSubmit = form.currentPassword && form.newPassword && form.confirm === form.newPassword && !isPending

    const set = (field: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((f) => ({ ...f, [field]: e.target.value }))
        setError(null)
    }

    const submit = () => {
        startTransition(async () => {
            const result = await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword })
            if (!result.ok) {
                setError(result.error)
                return
            }
            setForm(EMPTY)
            toast.success("Password changed")
        })
    }

    return (
        <Card className="p-6">
            <div className="flex items-start gap-4">
                <div className="rounded-md bg-surface-2 p-2.5 text-muted">
                    <KeyRound className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                    <h2 className="font-display text-lg font-semibold uppercase tracking-wide">Change password</h2>
                    <p className="max-w-md text-sm text-muted">
                        At least 6 characters with an uppercase letter, a lowercase letter and a number.
                    </p>
                </div>
            </div>

            <form
                className="mt-6 grid gap-4 border-t border-line pt-6 md:grid-cols-3"
                onSubmit={(e) => {
                    e.preventDefault()
                    if (canSubmit) submit()
                }}
            >
                <div className="space-y-2">
                    <label htmlFor="current-password" className="text-xs font-semibold uppercase tracking-wider text-muted">Current password</label>
                    <input id="current-password" type="password" value={form.currentPassword} onChange={set("currentPassword")} autoComplete="current-password" maxLength={72} className={inputClass} />
                </div>
                <div className="space-y-2">
                    <label htmlFor="new-password" className="text-xs font-semibold uppercase tracking-wider text-muted">New password</label>
                    <input id="new-password" type="password" value={form.newPassword} onChange={set("newPassword")} autoComplete="new-password" maxLength={72} className={inputClass} />
                </div>
                <div className="space-y-2">
                    <label htmlFor="confirm-password" className="text-xs font-semibold uppercase tracking-wider text-muted">Confirm new password</label>
                    <input
                        id="confirm-password"
                        type="password"
                        value={form.confirm}
                        onChange={set("confirm")}
                        autoComplete="new-password"
                        maxLength={72}
                        aria-invalid={mismatch}
                        aria-describedby={mismatch ? "confirm-password-error" : undefined}
                        className={inputClass}
                    />
                    {mismatch && <p id="confirm-password-error" className="text-xs text-status-dropped">Passwords don&apos;t match</p>}
                </div>

                <div className="flex flex-col-reverse items-start gap-3 md:col-span-3 md:flex-row md:items-center md:justify-end">
                    {error && <p role="alert" className="text-sm text-status-dropped">{error}</p>}
                    <Button type="submit" variant="secondary" disabled={!canSubmit}>
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Change password"}
                    </Button>
                </div>
            </form>
        </Card>
    )
}
