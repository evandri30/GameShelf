'use client';

import Link from "next/link";
import { signOut } from "next-auth/react";
import { toast } from "react-toastify";
import { LogOut } from "lucide-react";
import Menu, { MenuDivider, menuItemClass } from "./ui/Menu";

export default function UserMenu({ name }: { name: string }) {
    return (
        <Menu
            label="Open user menu"
            triggerClassName="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong bg-surface-2 font-display text-sm font-bold uppercase text-accent transition-colors hover:border-accent"
            trigger={name[0]}
        >
            {(close) => (
                <>
                    <p className="truncate px-4 py-2 text-xs text-muted">Signed in as <span className="text-fg">{name}</span></p>
                    <MenuDivider />
                    {/* the main sections live in the navbar on desktop; keep them here for quick access */}
                    <Link href="/dashboard" role="menuitem" className={menuItemClass} onClick={close}>Stats</Link>
                    <Link href="/shelf" role="menuitem" className={menuItemClass} onClick={close}>My Shelf</Link>
                    <MenuDivider />
                    <button
                        type="button"
                        role="menuitem"
                        className={`${menuItemClass} text-status-dropped`}
                        onClick={() => {
                            close()
                            toast.success("Logged out successfully")
                            signOut({ callbackUrl: "/" })
                        }}
                    >
                        <LogOut className="h-4 w-4" /> Logout
                    </button>
                </>
            )}
        </Menu>
    )
}
