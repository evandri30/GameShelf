"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Check, Copy, ExternalLink, Globe, Loader2, Lock } from "lucide-react"
import { toast } from "react-toastify"
import { updateProfile } from "@/app/profile/actions"
import { USERNAME_PATTERN } from "@/schemas/profile.schema"
import { Card } from "@/components/ui/Card"
import Button from "@/components/ui/Button"

type Props = { username: string; isPublic: boolean }

// Public profile settings: visibility switch, username and a copyable link
export default function ProfileCard({ username: initialUsername, isPublic: initialPublic }: Props) {
    const [isPending, startTransition] = useTransition()
    const [saved, setSaved] = useState({ username: initialUsername, isPublic: initialPublic })
    const [draft, setDraft] = useState(initialUsername)
    const [copied, setCopied] = useState(false)

    const path = `/u/${saved.username}`
    const draftValid = USERNAME_PATTERN.test(draft)
    const draftChanged = draft !== saved.username

    const save = (patch: { username?: string; isPublic?: boolean }, message: string) => {
        startTransition(async () => {
            const result = await updateProfile(patch)
            if (!result.ok || !result.data) {
                toast.error(result.ok ? "Failed to save" : result.error)
                return
            }
            setSaved(result.data)
            setDraft(result.data.username)
            toast.success(message)
        })
    }

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}${path}`)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch {
            toast.error("Couldn't copy the link")
        }
    }

    return (
        <Card className="p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                    <div className={`rounded-md p-2.5 ${saved.isPublic ? "bg-accent/15 text-accent" : "bg-surface-2 text-muted"}`}>
                        {saved.isPublic ? <Globe className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                    </div>
                    <div className="space-y-1">
                        <h2 className="font-display text-lg font-semibold uppercase tracking-wide">Public profile</h2>
                        <p className="max-w-md text-sm text-muted">
                            {saved.isPublic
                                ? "Anyone with the link can see your shelf, stats and lists. Your notes stay private."
                                : "Your profile is private. Turn it on to share your shelf, stats and lists."}
                        </p>
                    </div>
                </div>

                {/* visibility switch */}
                <button
                    type="button"
                    role="switch"
                    aria-checked={saved.isPublic}
                    aria-label="Public profile"
                    disabled={isPending}
                    onClick={() => save({ isPublic: !saved.isPublic }, saved.isPublic ? "Profile is now private" : "Profile is now public")}
                    className={`relative h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors disabled:opacity-50 ${saved.isPublic ? "bg-accent" : "bg-line-strong"}`}
                >
                    <span className={`absolute top-1 h-5 w-5 rounded-full bg-base transition-[left] ${saved.isPublic ? "left-6" : "left-1"}`} />
                </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-line pt-6 md:grid-cols-2">
                <form
                    className="space-y-2"
                    onSubmit={(e) => {
                        e.preventDefault()
                        if (draftValid && draftChanged) save({ username: draft }, "Username updated")
                    }}
                >
                    <label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-muted">Username</label>
                    <div className="flex gap-2">
                        <div className="flex min-w-0 flex-1 items-center rounded-md border border-line-strong bg-surface-2 focus-within:border-accent">
                            <span className="pl-3 font-mono text-sm text-subtle">/u/</span>
                            <input
                                id="username"
                                value={draft}
                                onChange={(e) => setDraft(e.target.value.toLowerCase())}
                                maxLength={20}
                                autoComplete="off"
                                aria-invalid={!draftValid}
                                aria-describedby="username-hint"
                                className="h-10 min-w-0 flex-1 bg-transparent pr-3 font-mono text-sm text-fg focus:outline-none"
                            />
                        </div>
                        <Button type="submit" variant="secondary" disabled={!draftValid || !draftChanged || isPending}>
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                        </Button>
                    </div>
                    <p id="username-hint" className={`text-xs ${draftValid ? "text-subtle" : "text-status-dropped"}`}>
                        3–20 characters: a–z, 0–9, - or _. Changing it breaks old links.
                    </p>
                </form>

                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">Your link</p>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={copy} className="min-w-0 flex-1 justify-start font-mono" disabled={!saved.isPublic}>
                            {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                            <span className="truncate">{path}</span>
                        </Button>
                        <Link href={path} className="inline-flex h-10 items-center gap-1 rounded-md px-3 text-sm text-accent hover:underline">
                            View <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                    {!saved.isPublic && <p className="text-xs text-subtle">Only you can open this link while the profile is private.</p>}
                </div>
            </div>
        </Card>
    )
}
