import type { FeatureCardProps } from '@/types'

export default function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
    return (
        <div
            className="group rounded-xl border border-line bg-surface p-6
                 flex flex-col items-center text-center gap-4
                 transition-all duration-300 hover:bg-surface-2 hover:-translate-y-1.5"
        >
            <div className="w-14 h-14 flex items-center justify-center rounded-lg
                       bg-surface-2 group-hover:bg-line-strong transition">
                <Icon className="w-7 h-7 text-fg" />
            </div>

            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted">{description}</p>
        </div>
    );
}
