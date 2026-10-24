"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Tells the server the browser's time zone, so Stats count months the way the user lives them.
// Only refreshes when the zone is new or changed, i.e. on the first visit or after travelling.
export default function TimeZoneCookie() {
    const router = useRouter()

    useEffect(() => {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
        if (!tz) return
        const current = document.cookie.match(/(?:^|; )tz=([^;]*)/)?.[1]
        if (current && decodeURIComponent(current) === tz) return

        document.cookie = `tz=${encodeURIComponent(tz)}; path=/; max-age=31536000; SameSite=Lax`
        router.refresh()
    }, [router])

    return null
}
