import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getShelfExport } from "@/services/shelf.service"

type Row = Awaited<ReturnType<typeof getShelfExport>>[number]

const COLUMNS: (keyof Row)[] = [
    "title", "slug", "rawgId", "status", "rating", "playtime", "caption", "startedAt", "completedAt", "createdAt", "updatedAt",
]

function csvCell(value: Row[keyof Row]) {
    if (value === null || value === undefined) return ""
    const text = value instanceof Date ? value.toISOString() : String(value)
    // quote anything a spreadsheet could misread; a leading = + - @ is neutralised against formula injection
    const safe = /^[=+\-@]/.test(text) ? `'${text}` : text
    return /[",\n\r]/.test(safe) || safe !== text ? `"${safe.replace(/"/g, '""')}"` : safe
}

// GET /api/export?format=csv|json downloads the signed-in user's whole shelf
export async function GET(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Please log in first" }, { status: 401 })
    }

    const format = new URL(req.url).searchParams.get("format") === "json" ? "json" : "csv"
    const rows = await getShelfExport(session.user.id)
    const filename = `gameshelf-${new Date().toISOString().slice(0, 10)}.${format}`

    const body = format === "json"
        ? JSON.stringify(rows, null, 2)
        // BOM so Excel opens the file as UTF-8
        : "﻿" + [COLUMNS.join(","), ...rows.map((row) => COLUMNS.map((c) => csvCell(row[c])).join(","))].join("\r\n")

    return new Response(body, {
        headers: {
            "Content-Type": format === "json" ? "application/json; charset=utf-8" : "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Cache-Control": "no-store",
        },
    })
}
