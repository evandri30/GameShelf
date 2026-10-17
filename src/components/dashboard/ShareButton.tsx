"use client"

import { Share2 } from "lucide-react"
import { toast } from "react-toastify"
import Button from "@/components/ui/Button"

export default function ShareButton({ userId }: { userId: string }) {
    const handleShare = async () => {
        const url = `${window.location.origin}/dashboard/share/${userId}`

        try {
            await navigator.clipboard.writeText(url)
            toast.success("Dashboard link copied to clipboard!")
        } catch {
            toast.error("Failed to copy link.")
        }
    }

    return (
        <Button onClick={handleShare} size="lg">
            <Share2 className="h-4 w-4" />
            <span>Share Dashboard</span>
        </Button>
    )
}
