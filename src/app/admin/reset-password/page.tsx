'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

function ResetPasswordContent() {
    const [isRecovery, setIsRecovery] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()
    const searchParams = useSearchParams()

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        const code = searchParams.get('code')
        if (code) {
            supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
                if (!error) {
                    setIsRecovery(true)
                } else {
                    setError('The reset link is invalid or has expired.')
                }
            })
        }

        if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
            setIsRecovery(true)
        }

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsRecovery(true)
            }
        })

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setIsRecovery(true)
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [searchParams, supabase.auth])

    const handleSendLink = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        const redirectTo = `${window.location.origin}/admin/reset-password`
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo,
        })

        setLoading(false)
        if (error) {
            setError(error.message)
        } else {
            setMessage('Password reset link sent! Check your inbox.')
        }
    }

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.')
            setLoading(false)
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            setLoading(false)
            return
        }

        const { error } = await supabase.auth.updateUser({
            password,
        })

        setLoading(false)
        if (error) {
            setError(error.message)
        } else {
            setMessage('Password updated successfully! Redirecting to login...')
            setTimeout(() => {
                router.push('/admin/login')
            }, 1500)
        }
    }

    return (
        <div className="flex min-h-screen flex-col justify-center items-center bg-background text-foreground px-6 transition-colors">
            <div className="w-full max-w-[380px] space-y-6">
                <div className="flex items-center justify-between text-xs text-secondary">
                    <Link
                        href="/admin/login"
                        className="hover:text-foreground transition-colors no-underline"
                    >
                        &larr; Back to login
                    </Link>
                    <ThemeToggle />
                </div>

                <div className="space-y-1.5">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {isRecovery ? 'Set New Password 🔑' : 'Reset Password ✉️'}
                    </h1>
                    <p className="text-secondary text-xs sm:text-sm">
                        {isRecovery
                            ? 'Enter and confirm your new admin password.'
                            : 'Enter your admin email to receive a password recovery link.'}
                    </p>
                </div>

                <div className="bg-surface/40 p-6 rounded-xl border border-border">
                    {isRecovery ? (
                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-medium text-secondary">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-3.5 py-2 border border-border bg-background rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-medium text-secondary">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                                    {loading ? 'Updating Password...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleSendLink} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-medium text-secondary">
                                    Admin Email
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
                            <div className="pt-1">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-foreground text-background py-2.5 rounded-lg text-xs sm:text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                                >
                                    {loading ? 'Sending link...' : 'Send Recovery Link'}
                                </button>
                            </div>
                        </form>
                    )}

                    {message && (
                        <p className="text-emerald-500 text-xs mt-3 text-center">
                            {message}
                        </p>
                    )}
                    {error && (
                        <p className="text-red-500 text-xs mt-3 text-center">
                            {error}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <ResetPasswordContent />
        </Suspense>
    )
}
