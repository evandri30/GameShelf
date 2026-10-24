import { Mail } from 'lucide-react'
import { cacheLife } from 'next/cache'
import { GithubIcon, LinkedinIcon } from './icons/BrandIcons'

// new Date() is not allowed in the prerendered shell; a cached scope keeps the footer static
async function CurrentYear() {
    'use cache'
    cacheLife('days')
    return <>{new Date().getFullYear()}</>
}

export default function Footer() {
    const linkClass = "text-muted transition-colors hover:text-accent"

    return (
        <footer className="mt-24 border-t border-line">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted md:flex-row">
                <div className="flex flex-col items-center gap-1 md:items-start">
                    <p>
                        © <CurrentYear /> <span className="font-display font-semibold uppercase tracking-wider text-fg">GameShelf</span>
                    </p>
                    {/* RAWG's API terms require a visible link back on pages that use their data */}
                    <p className="text-xs text-subtle">
                        Game data by <a href="https://rawg.io" className={linkClass} target="_blank" rel="noopener noreferrer">RAWG</a>
                    </p>
                </div>

                <div className="flex gap-5">
                    <a href="mailto:evandriridhoh@gmail.com" className={linkClass} aria-label="Email Us">
                        <Mail className="h-5 w-5" />
                    </a>
                    <a href="https://github.com/evandri30" className={linkClass} aria-label="Github Account" target="_blank" rel="noopener noreferrer">
                        <GithubIcon className="h-5 w-5" />
                    </a>
                    <a href="https://linkedin.com/in/evandriridho" className={linkClass} aria-label="Connect me" target="_blank" rel="noopener noreferrer">
                        <LinkedinIcon className="h-5 w-5" />
                    </a>
                </div>
            </div>
        </footer>
    );
}
