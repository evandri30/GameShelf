import AuthForm from '@/components/auth/AuthForm'
import CoverCollage from '@/components/CoverCollage'

export default function AuthPage() {
    return (
        <div className="grid min-h-[calc(100dvh-4rem)] lg:grid-cols-2">
            {/* Form */}
            <div className="flex animate-fade-up items-center justify-center px-6 py-16">
                <AuthForm />
            </div>

            {/* Cover art panel (desktop) */}
            <div className="relative isolate hidden overflow-hidden border-l border-line lg:block">
                <CoverCollage className="absolute inset-0 -z-10 opacity-70" columns={3} />
                <div className="absolute inset-0 -z-10 bg-linear-to-t from-base via-base/50 to-base/20" />
                <div className="flex h-full flex-col justify-end p-12">
                    <p className="font-display text-4xl font-bold uppercase leading-tight tracking-tight">
                        Every game you play.
                        <br />
                        <span className="text-accent">One shelf.</span>
                    </p>
                    <p className="mt-3 max-w-sm text-muted">No ads. No clutter. Just your games.</p>
                </div>
            </div>
        </div>
    )
}
