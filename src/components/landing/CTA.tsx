import Link from "next/link"

export default function CTA() {
    return (
        <>
            <h2 className="text-2xl font-semibold">
                Ready to organize your collection?
            </h2>
            <Link
                href="/auth"
                className="mt-4 inline-block px-8 py-3 rounded-lg bg-accent text-accent-fg font-medium
                             hover:-translate-y-0.5 hover:shadow-glow
                             transition"
            >
                Create Your Shelf
            </Link>
        </>
    )
}