import { cookies } from "next/headers"

// Set by components/TimeZoneCookie.tsx from the browser's Intl settings
export const TIME_ZONE_COOKIE = "tz"

export function isValidTimeZone(tz: string) {
    try {
        new Intl.DateTimeFormat("en", { timeZone: tz })
        return true
    } catch {
        return false
    }
}

// The viewer's IANA zone, e.g. "Asia/Jakarta"; UTC until the browser has reported it
export async function getTimeZone() {
    const tz = (await cookies()).get(TIME_ZONE_COOKIE)?.value
    return tz && isValidTimeZone(tz) ? tz : "UTC"
}

const formatters = new Map<string, Intl.DateTimeFormat>()

function partsIn(date: Date, tz: string) {
    let format = formatters.get(tz)
    if (!format) {
        format = new Intl.DateTimeFormat("en-US", {
            timeZone: tz, hourCycle: "h23",
            year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric",
        })
        formatters.set(tz, format)
    }
    const parts = Object.fromEntries(format.formatToParts(date).map((p) => [p.type, Number(p.value)]))
    return parts as Record<"year" | "month" | "day" | "hour" | "minute" | "second", number>
}

// Calendar year and month (0-11) of an instant as seen in `tz`
export function zonedParts(date: Date, tz: string) {
    const { year, month } = partsIn(date, tz)
    return { year, month: month - 1 }
}

// The UTC instant of local midnight on the 1st of a month in `tz`; month may run past 0-11
export function zonedStartOfMonth(year: number, month: number, tz: string) {
    const guess = Date.UTC(year, month, 1)
    // how far the zone's wall clock is ahead of UTC at that moment
    const p = partsIn(new Date(guess), tz)
    const offset = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - guess
    return new Date(guess - offset)
}
