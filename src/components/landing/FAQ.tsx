import { Plus } from "lucide-react"
import { faqData } from '@/constants/faq'
import { SectionHeading } from "@/components/ui/Card"

// Native <details>: accessible accordion with no client JS
export default function FAQ() {
    return (
        <div className="mx-auto max-w-3xl space-y-8">
            <SectionHeading title="Frequently asked questions" />

            <div className="space-y-3">
                {faqData.map((faq) => (
                    <details
                        key={faq.id}
                        className="group rounded-lg border border-line bg-surface transition-colors open:border-accent/40 hover:border-line-strong"
                    >
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left font-medium text-fg [&::-webkit-details-marker]:hidden">
                            {faq.question}
                            <Plus className="h-5 w-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-45 group-open:text-accent" aria-hidden />
                        </summary>
                        <p className="px-6 pb-5 leading-relaxed text-muted">{faq.answer}</p>
                    </details>
                ))}
            </div>
        </div>
    )
}
