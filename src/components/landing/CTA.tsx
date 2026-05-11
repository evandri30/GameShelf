import Link from "next/link"

export default function CTA() {
    return (
        <>
            <h2 className="text-2xl font-semibold">
                Ready to organize your collection?
            </h2>
            <Link
                href="/auth"
                className="mt-4 inline-block px-8 py-3 rounded-lg bg-white text-black font-medium
                             hover:-translate-y-0.5 hover:shadow-[0_15px_35px_rgba(255,255,255,0.25)]
                             transition"
            >
                Create Your Shelf
            </Link>
        </>
    )
}