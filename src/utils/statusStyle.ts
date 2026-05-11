export function getStatusStyle(status: string) {
    switch (status) {
        case "PLANNED":
            return "border-zinc-700 text-zinc-300 bg-zinc-900/60"

        case "PLAYING":
            return "border-blue-500 text-blue-400 bg-blue-950/40"

        case "COMPLETED":
            return "border-green-500 text-green-400 bg-green-950/40"

        case "DROPPED":
            return "border-red-500 text-red-400 bg-red-950/40"

        default:
            return "border-zinc-700 text-zinc-300 bg-zinc-900/60"
    }
}