'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

type StarRatingProps = {
    value: number
    onChange?: (value: number) => void
    disabled?: boolean
    size?: 'sm' | 'md'
}

export default function StarRating({ value, onChange, disabled, size = 'md' }: StarRatingProps) {
    const [hover, setHover] = useState(0)
    const shown = hover || value
    const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6'

    if (!onChange) {
        return (
            <div className="flex gap-0.5" aria-label={`Rated ${value} out of 5`}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`${iconSize} ${star <= value ? 'fill-accent text-accent' : 'text-line-strong'}`} aria-hidden />
                ))}
            </div>
        )
    }

    return (
        <div className="flex gap-0.5" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    role="radio"
                    aria-checked={star === value}
                    aria-label={`${star} star${star > 1 ? 's' : ''}`}
                    disabled={disabled}
                    onMouseEnter={() => setHover(star)}
                    // clicking the current rating again clears it
                    onClick={() => onChange(star === value ? 0 : star)}
                    className="cursor-pointer rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed"
                >
                    <Star className={`${iconSize} transition-colors ${star <= shown ? 'fill-accent text-accent' : 'text-line-strong'}`} aria-hidden />
                </button>
            ))}
        </div>
    )
}
