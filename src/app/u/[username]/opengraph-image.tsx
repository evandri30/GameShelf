import { ImageResponse } from "next/og"
import { getPublicProfile } from "@/services/user.service"
import { getCroppedImageUrl } from "@/utils/image"

export const alt = "GameShelf profile"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const ACCENT = "#c6f432"
const BASE = "#07070a"

// Social preview for /u/<username>: name, headline stats and a strip of covers
export default async function Image({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params
    const profile = await getPublicProfile(username)

    // private or missing profiles get a generic card so nothing leaks through the preview
    if (!profile?.isPublic) {
        return new ImageResponse(
            (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: BASE, color: "#ededf2", fontSize: 80, fontWeight: 800 }}>
                    GAME<span style={{ color: ACCENT }}>SHELF</span>
                </div>
            ),
            size
        )
    }

    const name = profile.name || profile.username
    const completed = profile.shelves.filter((g) => g.status === "COMPLETED").length
    const hours = profile.shelves.reduce((acc, g) => acc + (g.playtime ?? 0), 0)
    const covers = profile.shelves.map((g) => g.backgroundImage).filter(Boolean).slice(0, 4) as string[]

    const stat = (value: number, label: string) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 52, fontWeight: 800, color: "#ededf2" }}>{value.toLocaleString("en-US")}</span>
            <span style={{ fontSize: 18, color: "#8b8b99", textTransform: "uppercase", letterSpacing: 3 }}>{label}</span>
        </div>
    )

    return new ImageResponse(
        (
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: BASE, padding: 64 }}>
                <div style={{ display: "flex", fontSize: 28, fontWeight: 800, letterSpacing: 4, color: "#ededf2" }}>
                    GAME<span style={{ color: ACCENT }}>SHELF</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", marginTop: 28 }}>
                    <span style={{ fontSize: 64, fontWeight: 800, color: "#ededf2", textTransform: "uppercase" }}>{name}</span>
                    <span style={{ fontSize: 30, color: ACCENT }}>@{profile.username}</span>
                </div>

                <div style={{ display: "flex", gap: 72, marginTop: 24 }}>
                    {stat(profile.shelves.length, "Games")}
                    {stat(completed, "Completed")}
                    {stat(hours, "Hours")}
                </div>

                <div style={{ display: "flex", gap: 16, marginTop: "auto", paddingTop: 24 }}>
                    {covers.map((src, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={getCroppedImageUrl(src, 420)} width={252} height={128} style={{ borderRadius: 10, objectFit: "cover" }} alt="" />
                    ))}
                </div>
            </div>
        ),
        size
    )
}
