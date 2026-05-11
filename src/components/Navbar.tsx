'use client';

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { CircleUserRound } from "lucide-react";
import { toast } from "react-toastify";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
    const { data: session, status } = useSession();
    const [isOpen, setIsOpen] = useState(false)

    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent | TouchEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handler)
        document.addEventListener("touchstart", handler)

        return () => {
            document.removeEventListener("mousedown", handler)
            document.removeEventListener("touchstart", handler)
        }
    }, [])

    return (
        <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur
                    border-b border-zinc-800 bg-black/60">
            <div className="mx-auto max-w-7xl px-6 py-4
                      flex items-center justify-between">

                {/* Logo */}
                <Link
                    href="/"
                    className="text-xl font-semibold tracking-tight
                     hover:opacity-80 transition"
                >
                    GameShelf
                </Link>

                {/* Right side */}
                <div className="flex items-center">
                    {
                        status === "loading" ?
                            (<p className="text-sm text-zinc-400">Loading...</p>) :
                            (session ? (
                                <div className="relative" ref={ref}>
                                    {/* Icon */}
                                    <CircleUserRound
                                        className="w-8 h-8 text-white cursor-pointer"
                                        onClick={() => setIsOpen(!isOpen)}
                                    />

                                    {/* Dropdown */}
                                    <div className={`absolute right-0 mt-2 w-40 
                  bg-zinc-900 border border-zinc-800 
                  rounded-lg shadow-lg 
                  ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"} 
                  transition-all duration-200`}>

                                        <Link
                                            href="/dashboard"
                                            className="block px-4 py-2 text-sm text-white hover:bg-zinc-800 rounded-t-lg transition"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/shelf"
                                            className="block px-4 py-2 text-sm text-white hover:bg-zinc-800 transition"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Shelf
                                        </Link>

                                        <button
                                            onClick={() => {
                                                signOut({ callbackUrl: "/" });
                                                toast.success("Logged out successfully");
                                                setIsOpen(false)
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-white hover:bg-zinc-800 rounded-b-lg transition"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    href="/auth"
                                    className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium
                            hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(255,255,255,0.25)]
                            transition"
                                >
                                    Get Started
                                </Link>
                            )
                            )
                    }
                </div>
            </div>
        </nav>
    );
}
