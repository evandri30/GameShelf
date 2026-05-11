import { Github, Mail, Linkedin } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="mt-32 border-t border-zinc-800">
            <div className="mx-auto max-w-7xl px-6 py-12
                      flex flex-col md:flex-row items-center
                      justify-between gap-6 text-sm text-zinc-400">

                {/* Left */}
                <p>
                    © {new Date().getFullYear()} GameShelf. All rights reserved.
                </p>

                {/* Links */}
                <div className="flex gap-6">
                    <a
                        href="#"
                        className="hover:text-white transition"
                        aria-label='Email Us'
                    >
                        <Mail />
                    </a>
                    <a
                        href="#"
                        className="hover:text-white transition"
                        aria-label='Github Account'
                    >
                        <Github />
                    </a>
                    <a
                        href="#"
                        className="hover:text-white transition"
                        aria-label='Connect me'
                    >
                        <Linkedin />
                    </a>
                </div>
            </div>
        </footer>
    );
}
