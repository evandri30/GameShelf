// Widths RAWG's /media/resize endpoint accepts; anything else redirects to the original
const RESIZE_WIDTHS = [80, 200, 420, 640, 1280, 1920]

// Only RAWG's media host may be stored or fetched server-side (the OG image renderer downloads
// every cover), otherwise a crafted cover URL could make the server request internal hosts
export function isRawgMediaUrl(url: string) {
    try {
        const { protocol, hostname, pathname } = new URL(url)
        return protocol === "https:" && (hostname === "media.rawg.io" || hostname === "api.rawg.io") && pathname.startsWith("/media/")
    } catch {
        return false
    }
}

// RAWG serves smaller variants of its media: /media/crop/600/400/... for card thumbnails and
// /media/resize/<width>/-/... for anything else. Requesting those instead of the multi-MB
// original makes the Next image optimizer (and the browser) download far less.
export function getCroppedImageUrl(url: string | null, width: number = 600, height: number = 400): string {
    if (!url) return ""

    const targetUrl = url.replace("api.rawg.io", "media.rawg.io")

    const match = targetUrl.match(/\/media\/(games|screenshots)\//)
    if (!match) return targetUrl

    // RAWG only provides the 600x400 crop; other sizes use the smallest resize width that covers the request
    const resizeWidth = RESIZE_WIDTHS.find((w) => w >= width) ?? RESIZE_WIDTHS[RESIZE_WIDTHS.length - 1]
    const variant = width === 600 && height === 400 ? `crop/600/400` : `resize/${resizeWidth}/-`
    return targetUrl.replace(`/media/${match[1]}/`, `/media/${variant}/${match[1]}/`)
}
