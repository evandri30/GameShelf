"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Loader2 } from 'lucide-react'
import { toast } from "react-toastify"

type Props = {
    rawgId: number;
    title: string;
    slug: string;
    backgroundImage: string | null;
}

export default function AddToShelfButton({ rawgId, title, slug, backgroundImage }: Props) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const addHandler = async () => {
        if (loading) return

        try {
            setLoading(true)

            const res = await fetch("/api/shelf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rawgId, title, slug, backgroundImage })
            })

            if (!res.ok) {
                throw new Error("Failed to add game")
            }

            router.push("/shelf")
            toast.success("Game added to shelf successfully")
        } catch (error) {
            console.log("error : ", error)
            toast.error("Game already in shelf")
        } finally {
            setLoading(false)
        }
    }


    return (
        <button
            onClick={addHandler}
            disabled={loading}
            className="flex gap-2 justify-center items-center text-sm px-3 py-1 rounded-md bg-zinc-900/80 hover:bg-zinc-600 cursor-pointer border border-zinc-700 text-zinc-300  transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? (<Loader2 className="w-4 h-4" />) : (<Plus className="w-4 h-4" />)}
            {loading ? "adding..." : "add to shelf"}
        </button>
    )
}