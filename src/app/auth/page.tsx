'use client'

import { useState, useRef, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Gamepad2, Eye, EyeOff } from 'lucide-react'
import { FadeIn } from '@/components/AnimatedSection'
import { toast } from 'react-toastify'
import { LoginSchema, RegisterSchema } from "@/schemas/auth.schema"

export default function AuthPage() {
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
            const fieldErrors: Record<string, string> = {};
            result.error.issues.forEach((err) => {
                if (err.path[0]) {
                    fieldErrors[err.path[0] as string] = err.message
                }
            })
            setErrors(fieldErrors)
            return
        }

        const signInResult = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (signInResult?.error) {
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
            const fieldErrors: Record<string, string> = {};
            result.error.issues.forEach((err) => {
                if (err.path[0]) {
                    fieldErrors[err.path[0] as string] = err.message
                }
            })
            setErrors(fieldErrors)
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
        <FadeIn>
            <main className="relative min-h-screen overflow-hidden flex items-center justify-center px-6 py-16">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_60%)]" />
                <div className="w-full max-w-md">
                    <div className="flex justify-center mb-8">
                        <span className="flex justify-center items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-xs text-zinc-400">
                            <Gamepad2 className="w-4 h-4" />
                            {isLogin ? 'Welcome back' : 'Join GameShelf'}
                        </span>
                    </div>

                    <div className="relative border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm rounded-xl p-8 shadow-2xl">
                        <h2 className="text-3xl font-bold mb-2 text-center text-white tracking-tight">
                            {isLogin ? 'Login' : 'Create Account'}
                        </h2>
                        <p className="text-center text-zinc-400 text-sm mb-6">
                            {isLogin ? 'Access your game collection' : 'Start organizing your games'}
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Name field */}
                            {!isLogin && (
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-zinc-300">
                                        Name
                                    </label>
                                    <input
                                        ref={nameRef}
                                        type="text"
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value);
                                            setErrors(prev => ({ ...prev, name: '' }))
                                        }}
                                        className={`w-full px-4 py-3 border rounded-lg 
                                             bg-zinc-800/50 text-white placeholder:text-zinc-500
                                             focus:outline-none focus:ring-2 focus:ring-white/20 
                                             transition ${errors.name ? 'border-red-500' : 'border-zinc-700'}`}
                                        placeholder="Your name"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                                    )}
                                </div>
                            )}

                            {/* Email field */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-zinc-300">
                                    Email
                                </label>
                                <input
                                    ref={emailRef}
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setErrors(prev => ({ ...prev, email: '' }))
                                    }}
                                    className={`w-full px-4 py-3 border rounded-lg 
                                         bg-zinc-800/50 text-white placeholder:text-zinc-500
                                         focus:outline-none focus:ring-2 focus:ring-white/20 
                                         transition ${errors.email ? 'border-red-500' : 'border-zinc-700'}`}
                                    placeholder="you@example.com"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                                )}
                            </div>

                            {/* Password field */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-zinc-300">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setErrors(prev => ({ ...prev, password: '' }))
                                        }}
                                        className={`w-full px-4 py-3 pr-12 border rounded-lg 
                                             bg-zinc-800/50 text-white placeholder:text-zinc-500
                                             focus:outline-none focus:ring-2 focus:ring-white/20 
                                             transition ${errors.password ? 'border-red-500' : 'border-zinc-700'}`}
                                        placeholder="••••••••"
                                    />
                                    <div className="absolute inset-y-0 right-3 flex items-center">
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-zinc-400 hover:text-white transition"
                                        >
                                            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                    </div>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-6 px-7 py-3 rounded-lg bg-white text-black font-medium
                                     hover:-translate-y-0.5 
                                     hover:shadow-[0_15px_35px_rgba(255,255,255,0.25)]
                                     disabled:opacity-50 disabled:cursor-not-allowed 
                                     disabled:hover:translate-y-0 disabled:hover:shadow-none
                                     transition-all"
                            >
                                {loading ? 'Loading...' : (isLogin ? 'Login' : 'Create Account')}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-zinc-400">
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <button
                                    onClick={() => {
                                        setIsLogin(!isLogin)
                                        setErrors({})
                                    }}
                                    className="text-white hover:underline font-medium transition"
                                    disabled={loading}
                                >
                                    {isLogin ? 'Sign up' : 'Log in'}
                                </button>
                            </p>
                        </div>
                    </div>

                    <p className="mt-6 text-center text-sm text-zinc-500">
                        No ads. No clutter. Just your games.
                    </p>
                </div>
            </main>
        </FadeIn>
    )
}