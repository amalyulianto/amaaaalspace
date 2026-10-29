'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

export default function AdminLogin() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError('Invalid email or password.')
            setLoading(false)
        } else {
            router.push('/admin')
            router.refresh()
        }
    }

    return (
        <div className="flex min-h-screen flex-col justify-center items-center bg-background text-foreground px-6 transition-colors">
            <div className="w-full max-w-[380px] space-y-6">
                <div className="flex items-center justify-between text-xs text-secondary">
                    <Link
                        href="/"
                        className="hover:text-foreground transition-colors no-underline"
                    >
                        &larr; Back to site
                    </Link>
                    <ThemeToggle />
                </div>

                <div className="space-y-1.5">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Admin Login 🔐
                    </h1>
                    <p className="text-secondary text-xs sm:text-sm">
                        Sign in to manage your writings, works, and guestbook.
                    </p>
                </div>

                <form
                    onSubmit={handleLogin}
                    className="space-y-4 bg-surface/40 p-6 rounded-xl border border-border"
                >
                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-secondary">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-3.5 py-2 border border-border bg-background rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors"
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="block text-xs font-medium text-secondary">
                                Password
                            </label>
                            <Link
                                href="/admin/reset-password"
                                className="text-xs text-primary hover:underline transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3.5 py-2 border border-border bg-background rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors"
                            required
                        />
                    </div>
                    <div className="pt-1">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-foreground text-background py-2.5 rounded-lg text-xs sm:text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </div>
                    {error && (
                        <p className="text-red-500 text-xs mt-3 text-center">
                            {error}
                        </p>
                    )}
                </form>
            </div>
        </div>
    )
}
