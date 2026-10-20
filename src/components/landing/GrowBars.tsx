"use client"

import { useEffect, useRef, useState } from "react"

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]

// Games finished per month in the "Look back" step; the bars grow once when they scroll into view
export default function GrowBars({ counts }: { counts: number[] }) {
    const ref = useRef<HTMLDivElement>(null)
    const [shown, setShown] = useState(false)
    const max = Math.max(...counts, 1)

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setShown(true)
                observer.disconnect()
            }
        }, { threshold: 0.6 })
        if (ref.current) observer.observe(ref.current)
        return () => observer.disconnect()
    }, [])

    return (
        <div ref={ref} role="img" aria-label={`Games finished per month: ${counts.join(", ")}`} className="flex h-28 items-end gap-1.5">
            {counts.map((count, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                    <div
                        className={`w-full origin-bottom rounded-sm ${i === counts.length - 1 ? "bg-accent" : "bg-accent/35"} ${shown ? "animate-bar-grow" : "scale-y-0"}`}
                        style={{ height: `${(count / max) * 88}px`, animationDelay: `${i * 45}ms` }}
                    />
                    <span className="text-[10px] text-subtle">{MONTHS[i]}</span>
                </div>
            ))}
        </div>
    )
}
