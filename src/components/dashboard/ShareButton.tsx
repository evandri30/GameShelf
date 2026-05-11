"use client"

import { Share2 } from "lucide-react"
import { toast } from "react-toastify"

export default function ShareButton({ userId }: { userId: string }) {
    const handleShare = async () => {
        const url = `${window.location.origin}/dashboard/share/${userId}`

        try {
            await navigator.clipboard.writeText(url)
            toast.success("Dashboard link copied to clipboard!")
        } catch (err) {
            toast.error("Failed to copy link.")
        }
    }

    return (
        <button
            onClick={handleShare}
            className="flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-white text-black font-medium rounded-full transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
        >
            <Share2 className="w-4 h-4" />
            <span>Share Dashboard</span>
        </button>
    )
}
