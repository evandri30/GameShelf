import { Mail } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from './icons/BrandIcons'

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
                        href="mailto:evandriridhoh@gmail.com"
                        className="hover:text-white transition"
                        aria-label='Email Us'
                    >
                        <Mail />
                    </a>
                    <a
                        href="https://github.com/evandri30"
                        className="hover:text-white transition"
                        aria-label='Github Account'
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <GithubIcon />
                    </a>
                    <a
                        href="https://linkedin.com/in/evandriridho"
                        className="hover:text-white transition"
                        aria-label='Connect me'
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <LinkedinIcon />
                    </a>
                </div>
            </div>
        </footer>
    );
}
