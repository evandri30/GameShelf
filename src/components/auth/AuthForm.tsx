'use client'

import { useState, useRef, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { LoginSchema, RegisterSchema } from "@/schemas/auth.schema"
import Button from '@/components/ui/Button'

function fieldErrorsFrom(issues: { path: PropertyKey[]; message: string }[]) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of issues) {
        if (issue.path[0]) fieldErrors[String(issue.path[0])] = issue.message
    }
    return fieldErrors
}

const inputClass = (hasError: boolean) =>
    `h-11 w-full rounded-md border bg-surface px-3 text-fg transition-colors placeholder:text-subtle focus:border-accent focus:outline-none ${hasError ? 'border-status-dropped' : 'border-line-strong'}`

export default function AuthForm() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter();
    const nameRef = useRef<HTMLInputElement>(null)
    const emailRef = useRef<HTMLInputElement>(null)

    const handleLogin = async () => {
        const result = LoginSchema.safeParse({ email, password })

        if (!result.success) {
            setErrors(fieldErrorsFrom(result.error.issues))
            return
        }

        const signInResult = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (signInResult?.code === 'rate_limited') {
            toast.error("Too many login attempts. Wait 15 minutes and try again.")
        } else if (signInResult?.error) {
            toast.error("Invalid email or password")
        } else {
            router.push('/games');
            router.refresh();
            toast.success("Logged in successfully")
        }
    }

    const handleRegister = async () => {
        const result = RegisterSchema.safeParse({ name, email, password })

        if (!result.success) {
            setErrors(fieldErrorsFrom(result.error.issues))
            return
        }

        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result.data),
        });

        const data = await res.json();

        if (res.ok) {
            const signInResult = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (signInResult?.ok) {
                router.push('/games')
                router.refresh()
                toast.success("Account created")
            };
        } else {
            toast.error(data.error || 'Registration failed')
        }
    }

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            if (isLogin) {
                await handleLogin()
            } else {
                await handleRegister()
            }
        } catch (err) {
            toast.error("Something went wrong")
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (isLogin) {
            emailRef.current?.focus()
        } else {
            nameRef.current?.focus()
        }
    }, [isLogin])

    return (
        <div className="w-full max-w-sm">
            <h1 className="font-display text-4xl font-bold uppercase tracking-wide">
                {isLogin ? 'Welcome back' : 'Join GameShelf'}
            </h1>
            <p className="mt-2 text-muted">
                {isLogin ? 'Log in to pick up where you left off.' : 'Create a free account and start your shelf.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
                {!isLogin && (
                    <div>
                        <label htmlFor="auth-name" className="mb-2 block text-sm font-medium text-fg/85">Name</label>
                        <input
                            id="auth-name"
                            ref={nameRef}
                            type="text"
                            autoComplete="name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setErrors(prev => ({ ...prev, name: '' }))
                            }}
                            aria-invalid={!!errors.name}
                            aria-describedby={errors.name ? "auth-name-error" : undefined}
                            className={inputClass(!!errors.name)}
                            placeholder="Your name"
                        />
                        {errors.name && <p id="auth-name-error" className="mt-1 text-sm text-status-dropped">{errors.name}</p>}
                    </div>
                )}

                <div>
                    <label htmlFor="auth-email" className="mb-2 block text-sm font-medium text-fg/85">Email</label>
                    <input
                        id="auth-email"
                        ref={emailRef}
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setErrors(prev => ({ ...prev, email: '' }))
                        }}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "auth-email-error" : undefined}
                        className={inputClass(!!errors.email)}
                        placeholder="you@example.com"
                    />
                    {errors.email && <p id="auth-email-error" className="mt-1 text-sm text-status-dropped">{errors.email}</p>}
                </div>

                <div>
                    <label htmlFor="auth-password" className="mb-2 block text-sm font-medium text-fg/85">Password</label>
                    <div className="relative">
                        <input
                            id="auth-password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete={isLogin ? "current-password" : "new-password"}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setErrors(prev => ({ ...prev, password: '' }))
                            }}
                            aria-invalid={!!errors.password}
                            aria-describedby={errors.password ? "auth-password-error" : undefined}
                            className={`${inputClass(!!errors.password)} pr-11`}
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center text-muted transition-colors hover:text-fg"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.password && <p id="auth-password-error" className="mt-1 text-sm text-status-dropped">{errors.password}</p>}
                </div>

                <Button type="submit" size="lg" disabled={loading} className="w-full">
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loading ? 'Please wait…' : (isLogin ? 'Log in' : 'Create account')}
                </Button>
            </form>

            <p className="mt-6 text-sm text-muted">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                    type="button"
                    onClick={() => {
                        setIsLogin(!isLogin)
                        setErrors({})
                    }}
                    className="cursor-pointer font-medium text-accent hover:underline"
                    disabled={loading}
                >
                    {isLogin ? 'Sign up' : 'Log in'}
                </button>
            </p>
        </div>
    )
}
