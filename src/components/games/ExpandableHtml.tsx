"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"

// Clamps long (already sanitized) HTML and offers "Read more" only when it actually overflows
export default function ExpandableHtml({ html, collapsedHeight = 260 }: { html: string; collapsedHeight?: number }) {
    const ref = useRef<HTMLDivElement>(null)
    const [expanded, setExpanded] = useState(false)
    const [overflows, setOverflows] = useState(true)

    useLayoutEffect(() => {
        if (ref.current) setOverflows(ref.current.scrollHeight > collapsedHeight + 40)
    }, [html, collapsedHeight])

    const clamped = overflows && !expanded

    return (
        <div>
            <div
                ref={ref}
                className="relative overflow-hidden leading-relaxed text-fg/80 [&_a]:text-accent [&_a]:underline [&_h3]:mt-4 [&_h3]:font-display [&_h3]:font-semibold [&_h3]:text-lg [&_h3]:text-fg [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-3"
                style={clamped ? { maxHeight: collapsedHeight } : undefined}
            >
                <div dangerouslySetInnerHTML={{ __html: html }} />
                {clamped && <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-surface to-transparent" aria-hidden />}
            </div>

            {overflows && (
                <button
                    type="button"
                    onClick={() => setExpanded((e) => !e)}
                    aria-expanded={expanded}
                    className="mt-3 inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-accent hover:underline"
                >
                    {expanded ? "Show less" : "Read more"}
                    <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>
            )}
        </div>
    )
}
