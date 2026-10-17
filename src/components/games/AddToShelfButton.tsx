"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Loader2 } from 'lucide-react'
import { toast } from "react-toastify"
import { addToShelf } from "@/app/shelf/actions"
import Button from "@/components/ui/Button"

type Props = {
    rawgId: number;
    title: string;
    slug: string;
    backgroundImage: string | null;
}

export default function AddToShelfButton({ rawgId, title, slug, backgroundImage }: Props) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const addHandler = () => {
        startTransition(async () => {
            const result = await addToShelf({ rawgId, title, slug, backgroundImage })

            if (!result.ok) {
                toast.error(result.error)
                return
            }

            toast.success("Game added to shelf successfully")
            router.push("/shelf")
        })
    }

    return (
        <Button onClick={addHandler} disabled={isPending} size="sm">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {isPending ? "Adding..." : "Add to shelf"}
        </Button>
    )
}
