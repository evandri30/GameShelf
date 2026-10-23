import { describe, expect, it } from "vitest"
import { LoginSchema, RegisterSchema } from "@/schemas/auth.schema"

function firstError(result: { success: boolean; error?: { issues: { message: string }[] } }) {
    return result.error?.issues[0]?.message
}

describe("LoginSchema", () => {
    it("accepts a valid email and password", () => {
        expect(LoginSchema.safeParse({ email: "me@test.dev", password: "secret1" }).success).toBe(true)
    })

    it("asks for an email when it is empty", () => {
        expect(firstError(LoginSchema.safeParse({ email: "", password: "secret1" }))).toBe("Email is Required")
    })

    it("rejects a malformed email", () => {
        expect(firstError(LoginSchema.safeParse({ email: "not-an-email", password: "secret1" }))).toBe("Invalid email format")
    })

    it("asks for a password when it is empty", () => {
        const result = LoginSchema.safeParse({ email: "me@test.dev", password: "" })
        expect(result.error?.issues.map((i) => i.message)).toContain("Password is Required")
    })

    it("rejects a password shorter than 6 characters", () => {
        expect(firstError(LoginSchema.safeParse({ email: "me@test.dev", password: "12345" }))).toBe("Password must be atleast 6 characters")
    })
})

describe("RegisterSchema", () => {
    const valid = { name: "Evan", email: "evan@test.dev", password: "Secret123" }

    it("accepts a valid sign-up", () => {
        expect(RegisterSchema.safeParse(valid).success).toBe(true)
    })

    it.each([
        ["", "Name is Required"],
        ["ab", "Name must be atleast 3 characters"],
        ["a".repeat(21), "Name is to long"],
    ])("rejects name %j", (name, message) => {
        expect(RegisterSchema.safeParse({ ...valid, name }).error?.issues.map((i) => i.message)).toContain(message)
    })

    it("asks for an email when it is empty", () => {
        expect(firstError(RegisterSchema.safeParse({ ...valid, email: "" }))).toBe("Email is required")
    })

    it.each([
        ["Sec12", "Password must be at least 6 characters"],
        ["secret123", "Password must contain at least one uppercase letter"],
        ["SECRET123", "Password must contain at least one lowercase letter"],
        ["SecretAbc", "Password must contain at least one number"],
    ])("rejects password %j", (password, message) => {
        expect(RegisterSchema.safeParse({ ...valid, password }).error?.issues.map((i) => i.message)).toContain(message)
    })
})
