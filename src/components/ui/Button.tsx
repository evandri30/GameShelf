import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const base =
    'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-[background-color,border-color,color,box-shadow] ' +
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ' +
    'disabled:pointer-events-none disabled:opacity-50 cursor-pointer'

const variants: Record<Variant, string> = {
    primary: 'bg-accent text-accent-fg hover:bg-accent-strong hover:shadow-glow',
    secondary: 'border border-line-strong bg-surface-2 text-fg hover:border-muted',
    ghost: 'text-muted hover:bg-surface-2 hover:text-fg',
    danger: 'border border-status-dropped/50 text-status-dropped hover:bg-status-dropped hover:text-accent-fg',
}

const sizes: Record<Size, string> = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
}

// Exposed so links can look like buttons without wrapping <a> in <button>
export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className = '') {
    return `${base} ${variants[variant]} ${sizes[size]} ${className}`
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant
    size?: Size
}

export default function Button({ variant = 'primary', size = 'md', className = '', type = 'button', ...props }: ButtonProps) {
    return <button type={type} className={buttonClass(variant, size, className)} {...props} />
}
