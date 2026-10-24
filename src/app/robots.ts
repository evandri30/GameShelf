import type { MetadataRoute } from "next"

// Private pages need a login anyway; keep crawlers on the public profiles and lists
export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/api/", "/auth", "/dashboard", "/shelf"],
        },
    }
}
