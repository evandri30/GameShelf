export function getCroppedImageUrl(url: string | null, width: number = 600, height: number = 400): string {
    if (!url) return ""

    let targetUrl = url
    if (targetUrl.includes("api.rawg.io")) {
        targetUrl = targetUrl.replace("api.rawg.io", "media.rawg.io")
    }

    if (width !== 600 || height !== 400) {
        return targetUrl
    }

    if (targetUrl.includes("media/games/")) {
        return targetUrl.replace("media/games/", `media/crop/${width}/${height}/games/`);
    } else if (targetUrl.includes("media/screenshots/")) {
        return targetUrl.replace("media/screenshots/", `media/crop/${width}/${height}/screenshots/`);
    }

    return targetUrl
}