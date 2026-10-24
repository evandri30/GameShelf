"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Camera, Loader2, Trash2 } from "lucide-react"
import { toast } from "react-toastify"
import { removeAvatar, updateProfile, uploadAvatar } from "@/app/profile/actions"
import { DisplayNameSchema } from "@/schemas/auth.schema"
import { Card } from "@/components/ui/Card"
import Button from "@/components/ui/Button"

type Props = { name: string | null; email: string; image: string | null }

const AVATAR_SIZE = 256

// Center-crops the photo to a 256px square so uploads stay a few dozen KB
async function shrinkPhoto(file: File): Promise<Blob> {
    const bitmap = await createImageBitmap(file)
    const side = Math.min(bitmap.width, bitmap.height)
    const canvas = document.createElement("canvas")
    canvas.width = canvas.height = AVATAR_SIZE
    canvas.getContext("2d")!.drawImage(
        bitmap,
        (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side,
        0, 0, AVATAR_SIZE, AVATAR_SIZE,
    )
    bitmap.close()

    const encode = (type: string) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85))
    // Safari can't encode WebP and hands back PNG instead; JPEG is smaller there
    const webp = await encode("image/webp")
    const blob = webp?.type === "image/webp" ? webp : await encode("image/jpeg")
    if (!blob) throw new Error("Couldn't read that image")
    return blob
}

// Nickname and profile picture, shown on the navbar and the public profile
export default function ProfileIdentityCard({ name: initialName, email, image: initialImage }: Props) {
    const router = useRouter()
    const fileRef = useRef<HTMLInputElement>(null)
    const [isSaving, startSaving] = useTransition()
    const [isUploading, startUploading] = useTransition()
    const [image, setImage] = useState(initialImage)
    const [savedName, setSavedName] = useState(initialName ?? "")
    const [draft, setDraft] = useState(initialName ?? "")

    const nameCheck = DisplayNameSchema.safeParse(draft)
    const draftChanged = draft.trim() !== savedName
    const initial = (savedName || email)[0].toUpperCase()

    const saveName = () => {
        startSaving(async () => {
            const result = await updateProfile({ name: draft })
            if (!result.ok) {
                toast.error(result.error)
                return
            }
            const next = result.data?.name ?? ""
            setSavedName(next)
            setDraft(next)
            toast.success("Nickname updated")
            router.refresh()
        })
    }

    const upload = (file: File) => {
        startUploading(async () => {
            try {
                const blob = await shrinkPhoto(file)
                const formData = new FormData()
                formData.append("avatar", new File([blob], "avatar", { type: blob.type }))
                const result = await uploadAvatar(formData)
                if (!result.ok || !result.data) {
                    toast.error(result.ok ? "Failed to save the photo" : result.error)
                    return
                }
                setImage(result.data.image)
                toast.success("Photo updated")
                router.refresh()
            } catch {
                toast.error("Couldn't read that image")
            }
        })
    }

    const remove = () => {
        startUploading(async () => {
            const result = await removeAvatar()
            if (!result.ok) {
                toast.error(result.error)
                return
            }
            setImage(null)
            toast.success("Photo removed")
            router.refresh()
        })
    }

    return (
        <Card className="p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <div className="flex items-center gap-5">
                    <div className="relative h-22 w-22 shrink-0">
                        {image ? (
                            // eslint-disable-next-line @next/next/no-img-element -- small versioned API image, nothing to optimize
                            <img src={image} alt="" className="h-22 w-22 rounded-full border-2 border-accent object-cover" />
                        ) : (
                            <div className="flex h-22 w-22 items-center justify-center rounded-full border-2 border-accent bg-surface font-display text-4xl font-bold text-accent">
                                {initial}
                            </div>
                        )}
                        {isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-base/70">
                                <Loader2 className="h-6 w-6 animate-spin text-accent" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col items-start gap-2">
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                e.target.value = ""
                                if (file) upload(file)
                            }}
                        />
                        <Button variant="secondary" size="sm" disabled={isUploading} onClick={() => fileRef.current?.click()}>
                            <Camera className="h-4 w-4" /> {image ? "Change photo" : "Upload photo"}
                        </Button>
                        {image && (
                            <button
                                type="button"
                                disabled={isUploading}
                                onClick={remove}
                                className="inline-flex cursor-pointer items-center gap-1 text-xs text-muted transition-colors hover:text-status-dropped disabled:opacity-50"
                            >
                                <Trash2 className="h-3.5 w-3.5" /> Remove
                            </button>
                        )}
                    </div>
                </div>

                <form
                    className="flex-1 space-y-2 md:border-l md:border-line md:pl-6"
                    onSubmit={(e) => {
                        e.preventDefault()
                        if (nameCheck.success && draftChanged) saveName()
                    }}
                >
                    <label htmlFor="nickname" className="text-xs font-semibold uppercase tracking-wider text-muted">Nickname</label>
                    <div className="flex gap-2">
                        <input
                            id="nickname"
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            maxLength={20}
                            autoComplete="nickname"
                            aria-invalid={!nameCheck.success}
                            aria-describedby="nickname-hint"
                            className="h-10 min-w-0 flex-1 rounded-md border border-line-strong bg-surface-2 px-3 text-sm text-fg focus:border-accent focus:outline-none"
                        />
                        <Button type="submit" variant="secondary" disabled={!nameCheck.success || !draftChanged || isSaving}>
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                        </Button>
                    </div>
                    <p id="nickname-hint" className={`text-xs ${nameCheck.success ? "text-subtle" : "text-status-dropped"}`}>
                        3–20 characters, shown on your profile and the navbar. Signed in as {email}.
                    </p>
                </form>
            </div>
        </Card>
    )
}
