"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import { getStatusStyle } from "@/utils/statusStyle"
import type { ShelfFDetailProps } from "@/types"
import { getCroppedImageUrl } from "@/utils/image"

type Props = {
    shelf: ShelfFDetailProps
}

export default function ShelfDetail({ shelf }: Props) {
    const router = useRouter()

    const [currentStatus, setCurrentStatus] = useState(shelf.status)
    const [caption, setCaption] = useState(shelf.caption || "")
    const [playHour, setPlayHour] = useState<number | string>(shelf.playtime || 0)
    const [rating, setRating] = useState(shelf.rating ?? 0)
    const [isEditingCaption, setIsEditingCaption] = useState(false)
    const [isEditingPlayHour, setIsEditingPlayHour] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleUpdateStatus = async (value: string) => {
        try {
            setLoading(true)

            const res = await fetch(`/api/shelf/${shelf.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: value, caption: caption || null, playtime: playHour || 0, rating: rating || 0 })
            })

            if (!res.ok) throw new Error("Failed to update")

            setCurrentStatus(value)
            toast.success("Status updated successfully")
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Failed to update status")
        } finally {
            setLoading(false)
        }
    }

    const handleRating = async (value: number) => {
        try {
            setLoading(true)

            const res = await fetch(`/api/shelf/${shelf.id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ rating: value, status: currentStatus, caption: caption || null, playtime: playHour || 0 })
                }
            )

            if (!res.ok) {
                throw new Error("Failed to update")
            }

            setRating(value)
            toast.success("Rating updated successfully")
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Failed to updated rating")
        } finally {
            setLoading(false)
        }
    }

    const handleSaveCaption = async () => {
        try {
            setLoading(true)

            const res = await fetch(`/api/shelf/${shelf.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ caption: caption || null, status: currentStatus, playtime: playHour || 0, rating: rating || 0 })
            })

            if (!res.ok) throw new Error("Failed to update")

            toast.success("Caption saved successfully")
            setIsEditingCaption(false)
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Failed to save caption")
        } finally {
            setLoading(false)
        }
    }

    const handleSavePlayHour = async () => {
        try {
            setLoading(true)

            const finalHours = playHour === "" ? 0 : Number(playHour)

            const res = await fetch(`/api/shelf/${shelf.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ playtime: finalHours, status: currentStatus, caption: caption || null, rating: rating || 0 })
            })

            if (!res.ok) throw new Error("Failed to update")

            toast.success("Play hours saved successfully")
            setIsEditingPlayHour(false)
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Failed to save play hours")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-5xl mx-auto px-6 py-16">
            {/* Back Button */}
            <Link
                href="/shelf"
                className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition mb-8"
            >
                <span>←</span>
                <span>Back to Shelf</span>
            </Link>

            {/* Header Section */}
            <div className="relative w-full h-96 rounded-2xl overflow-hidden mb-8">
                {shelf.backgroundImage ? (
                    <Image
                        src={getCroppedImageUrl(shelf.backgroundImage, 1200, 720)}
                        alt={shelf.title}
                        fill
                        sizes="100vw"
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                        No Image
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </div>

            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-4">{shelf.title}</h1>

                <div className="flex items-center gap-4 flex-wrap">
                    <div className={`inline-block text-sm px-4 py-2 rounded-full border ${getStatusStyle(currentStatus)}`}>
                        {currentStatus}
                    </div>

                    <div className="flex gap-1 ">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => handleRating(star)}
                                disabled={loading}
                                className={`text-2xl transition ${star <= rating
                                    ? "text-yellow-400"
                                    : "text-zinc-600"
                                    } hover:scale-110`}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid md:grid-cols-3 gap-8">
                {/* Left Column - Status & Play Hours */}
                <div className="space-y-6">
                    {/* Status Selector */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Update Status</h3>
                        <select
                            className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-white transition"
                            value={currentStatus}
                            disabled={loading}
                            onChange={(e) => handleUpdateStatus(e.target.value)}
                        >
                            <option value="PLANNED">PLANNED</option>
                            <option value="PLAYING">PLAYING</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="DROPPED">DROPPED</option>
                        </select>
                    </div>

                    {/* Play Hours */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Play Hours</h3>

                        {isEditingPlayHour ? (
                            <div className="space-y-3">
                                <input
                                    type="number"
                                    min="0"
                                    value={playHour === 0 ? "" : playHour}
                                    onChange={(e) => {
                                        const val = e.target.value;

                                        if (val === "") {
                                            setPlayHour("")
                                        } else {
                                            setPlayHour(parseInt(val, 10))
                                        }
                                    }}
                                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-white"
                                    placeholder="Enter hours played"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSavePlayHour}
                                        disabled={loading}
                                        className="flex-1 px-3 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition disabled:opacity-50"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditingPlayHour(false)
                                            setPlayHour(shelf.playtime || 0)
                                        }}
                                        className="flex-1 px-3 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-3xl font-bold text-white mb-2">
                                    {playHour || 0} <span className="text-lg text-zinc-400">hours</span>
                                </p>
                                <button
                                    onClick={() => setIsEditingPlayHour(true)}
                                    className="text-sm text-zinc-400 hover:text-white transition"
                                >
                                    Edit →
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Caption */}
                <div className="md:col-span-2">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">My Notes</h3>
                            {!isEditingCaption && (
                                <button
                                    onClick={() => setIsEditingCaption(true)}
                                    className="text-sm text-zinc-400 hover:text-white transition"
                                >
                                    Edit →
                                </button>
                            )}
                        </div>

                        {isEditingCaption ? (
                            <div className="space-y-3">
                                <textarea
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    className="w-full h-40 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-white resize-none"
                                    placeholder="Write your thoughts about this game..."
                                    maxLength={1000}
                                />
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-zinc-500">
                                        {caption.length}/1000 characters
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSaveCaption}
                                            disabled={loading}
                                            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition disabled:opacity-50"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditingCaption(false)
                                                setCaption(shelf.caption || "")
                                            }}
                                            className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-zinc-300 whitespace-pre-wrap">
                                {caption || "No notes yet. Click Edit to add your thoughts about this game."}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}