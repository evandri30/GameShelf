import Link from "next/link";
import Form from "next/form";
import { Suspense } from "react";
import { Search } from "lucide-react";
import { getSession } from "@/auth";
import { buttonClass } from "./ui/Button";
import { Skeleton } from "./ui/Card";
import UserMenu from "./UserMenu";
import { MobileTabBar, NavLinks } from "./nav/NavLinks";

function NavSearch() {
    return (
        <Form action="/games" className="relative hidden lg:block" role="search">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden />
            <input
                name="search"
                type="search"
                placeholder="Search games..."
                aria-label="Search games"
                className="h-9 w-56 rounded-md border border-line bg-surface pl-9 pr-3 text-sm text-fg transition-[border-color,width] placeholder:text-subtle focus:w-72 focus:border-accent focus:outline-none"
            />
        </Form>
    )
}

// Session is read on the server, so there is no client session fetch and no "Loading..." flash
async function NavContent() {
    const session = await getSession();

    if (!session?.user) {
        return (
            <div className="flex flex-1 justify-end">
                <Link href="/auth" className={buttonClass("primary", "sm")}>
                    Get Started
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-1 items-center justify-between gap-4">
            <NavLinks />
            <div className="ml-auto flex items-center gap-3">
                <NavSearch />
                <UserMenu name={session.user.name ?? session.user.email ?? "Player"} />
            </div>
        </div>
    );
}

async function MobileNav() {
    const session = await getSession();
    return session?.user ? <MobileTabBar /> : null;
}

export default function Navbar() {
    return (
        <nav className="fixed inset-x-0 top-0 z-50 border-b border-line bg-base/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-6">
                <Link href="/" className="shrink-0 font-display text-xl font-bold uppercase tracking-wider transition-opacity hover:opacity-80">
                    Game<span className="text-accent">Shelf</span>
                </Link>

                <Suspense fallback={<div className="flex flex-1 justify-end"><Skeleton className="h-9 w-9 rounded-full" /></div>}>
                    <NavContent />
                </Suspense>
            </div>
        </nav>
    );
}

// Rendered after the footer in the layout: it's a fixed bar outside the blurred <nav>
// (backdrop-filter would otherwise trap position: fixed)
export function MobileNavSlot() {
    return (
        <Suspense fallback={null}>
            <MobileNav />
        </Suspense>
    );
}
