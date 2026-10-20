import { Plus } from "lucide-react"
import { faqData } from '@/constants/faq'

// Native <details>: accessible accordion with no client JS; globals.css animates the open/close
export default function FAQ() {
    return (
        <section aria-labelledby="faq-heading" className="grid gap-10 lg:grid-cols-[1fr_2fr]">
            <h2 id="faq-heading" className="font-display text-3xl font-bold uppercase tracking-wide md:text-4xl">
                Questions
            </h2>

            <div className="border-b border-line">
                {faqData.map((faq) => (
                    // same name: opening one question closes the others
                    <details key={faq.id} name="faq" className="group border-t border-line">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-medium text-fg transition-colors hover:text-accent [&::-webkit-details-marker]:hidden">
                            {faq.question}
                            <Plus className="h-5 w-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-45 group-open:text-accent" aria-hidden />
                        </summary>
                        <p className="max-w-2xl pb-5 leading-relaxed text-muted">{faq.answer}</p>
                    </details>
                ))}
            </div>
        </section>
    )
}
