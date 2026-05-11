"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import { getStatusStyle } from "@/utils/statusStyle"
import Swal from "sweetalert2"
import { getCroppedImageUrl } from "@/utils/image"

type Props = {
    id: string;
    title: string;
    slug: string;
    status: string;
    backgroundImage: string | null
}

const allowedStatus = ["PLANNED", "PLAYING", "COMPLETED", "DROPPED"]

export default function ShelfCard({ id, title, slug, status, backgroundImage }: Props) {
    const router = useRouter()


    const [currentStatus, setCurrentStatus] = useState(status)
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const handleChange = async (value: string) => {
        try {
            setLoading(true)

            const res = await fetch(`/api/shelf/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: value })
            })

            if (!res.ok) {
                throw new Error("Failed to update")
            }

            setCurrentStatus(value)
            toast.success("Status update successfully")
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Failed to update status")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: 'Remove this game from your shelf?',
            background: '#0a0a0a',
            color: '#ffffff',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#3f3f46',
            confirmButtonText: 'Yes, Remove',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: 'border border-white/10',
            }
        })

        if (!result.isConfirmed) return

        try {
            setDeleting(true)
            const res = await fetch(`/api/shelf/${id}`, {
                method: "DELETE"
            })

            if (!res.ok) {
                throw new Error("Failed to delete")
            }

            router.refresh()
            toast.success("Game removed from shelf successfully")
        } catch (error) {
            console.error(error)
            toast.error("Failed to delete")
        } finally {
            setDeleting(false)
        }
    }


    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden hover:border-zinc-600 transition"
        >
            {/* Image */}
            <Link href={`/shelf/${slug}`} className="block relative h-48 w-full">
                {backgroundImage ? (
                    <Image
                        src={getCroppedImageUrl(backgroundImage)}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                        No Image
                    </div>
                )}
            </Link>

            {/* Content */}
            <div className="p-5 text-left space-y-3">
                <h2 className="text-lg font-semibold text-white line-clamp-2 min-h-14">
                    {title}
                </h2>

                {/* Badge Status */}
                <div className={`inline-block text-xs px-3 py-1 rounded-full border ${getStatusStyle(currentStatus)}`}>
                    {currentStatus}
                </div>

                {/* Dropdown */}
                <select
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-white transition"
                    value={currentStatus}
                    disabled={loading}
                    onChange={(e) => handleChange(e.target.value)}
                >
                    {allowedStatus.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-full mt-2 px-3 py-2 rounded-lg border border-red-600 text-red-400 hover:bg-red-600 hover:text-white transition disabled:opacity-50"
                >
                    {deleting ? "Removing..." : "Remove from Shelf!"}
                </button>
            </div>
        </div>
    )
}