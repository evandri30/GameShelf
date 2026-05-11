import { useState } from "react"
import { faqData } from '@/constants/faq'

export default function FAQ() {
    const [isOpen, setIsOpen] = useState<number | null>(null);
    const toggleFAQ = (id: number) => {
        setIsOpen(isOpen === id ? null : id);
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold text-center mb-10 text-white">
                Frequently Asked Questions
            </h2>

            <div className="space-y-4">
                {faqData.map((faq) => (
                    <div
                        key={faq.id}
                        className={`rounded-xl border transition-all duration-300 ${isOpen === faq.id
                            ? "border-white/20 bg-zinc-900"
                            : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                            }`}
                    >
                        <button
                            onClick={() => toggleFAQ(faq.id)}
                            aria-expanded={isOpen === faq.id}
                            aria-controls={`faq-answer-${faq.id}`}
                            className="w-full px-6 py-5 flex justify-between items-center text-left"
                        >
                            <span id={`faq-question-${faq.id}`} className="font-medium text-lg text-white">
                                {faq.question}
                            </span>

                            <span
                                className={`text-xl transition-transform duration-300 ${isOpen === faq.id ? "rotate-45 text-white" : "text-zinc-400"
                                    }`}
                            >
                                +
                            </span>
                        </button>

                        <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen === faq.id ? "max-h-96 px-6 pb-5" : "max-h-0 px-6"
                                }`}
                            id={`faq-answer-${faq.id}`}
                            role="region"
                            aria-labelledby={`faq-question-${faq.id}`}
                        >
                            <p className="text-zinc-400 leading-relaxed">
                                {faq.answer}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}