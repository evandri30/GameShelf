import { describe, expect, it } from "vitest"
import { NextRequest } from "next/server"
import { encode } from "next-auth/jwt"
import { proxy } from "@/proxy"

const SECRET = "proxy-test-secret"
process.env.AUTH_SECRET = SECRET

async function visit(url: string, cookieName?: string) {
    const headers = new Headers()
    if (cookieName) {
        headers.set("cookie", `${cookieName}=${await encode({ token: { id: "u1" }, secret: SECRET, salt: cookieName })}`)
    }
    const res = await proxy(new NextRequest(url, { headers }))
    return res.headers.get("location")
}

describe("proxy", () => {
    it("sends signed-out visitors of a private page to the landing page", async () => {
        expect(await visit("https://gameshelf.test/shelf")).toBe("https://gameshelf.test/")
    })

    // Regression: on HTTPS the session cookie carries the __Secure- prefix and was not recognised
    it.each([
        ["https://gameshelf.test", "__Secure-authjs.session-token"],
        ["http://localhost:3000", "authjs.session-token"],
    ])("lets a signed-in visitor through on %s", async (origin, cookieName) => {
        expect(await visit(`${origin}/shelf`, cookieName)).toBeNull()
        expect(await visit(`${origin}/`, cookieName)).toBe(`${origin}/games`)
    })
})
