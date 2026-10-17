import Link from "next/link";
import { Suspense } from "react";
import { getSession } from "@/auth";
import { buttonClass } from "./ui/Button";
import { Skeleton } from "./ui/Card";
import UserMenu from "./UserMenu";

// Session is read on the server, so there is no client session fetch and no "Loading..." flash
async function NavUser() {
    const session = await getSession();

    if (!session?.user) {
        return (
            <Link href="/auth" className={buttonClass("primary", "sm")}>
                Get Started
            </Link>
        );
    }

    return <UserMenu name={session.user.name ?? session.user.email ?? "Player"} />;
}

export default function Navbar() {
    return (
        <nav className="fixed inset-x-0 top-0 z-50 border-b border-line bg-base/75 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                <Link href="/" className="font-display text-xl font-bold uppercase tracking-wider transition-opacity hover:opacity-80">
                    Game<span className="text-accent">Shelf</span>
                </Link>

                <Suspense fallback={<Skeleton className="h-9 w-9 rounded-full" />}>
                    <NavUser />
                </Suspense>
            </div>
        </nav>
    );
}
