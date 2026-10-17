import type { FeatureCardProps } from '@/types'

export default function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
    return (
        <div className="group rounded-lg border border-line bg-surface p-6 text-left transition-[border-color,box-shadow] hover:border-accent/50 hover:shadow-glow">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-accent/10 text-accent">
                <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-semibold uppercase tracking-wide">{title}</h3>
            <p className="mt-2 text-sm text-muted">{description}</p>
        </div>
    );
}
