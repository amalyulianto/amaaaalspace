'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

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
        <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#111111] px-6 transition-colors">
            <div className="w-full max-w-[400px]">
                <div className="mb-8 text-center text-[#111111] dark:text-[#FFFFFF]">
                    <h1 className="text-xl font-bold mb-2">Admin Login</h1>
                    <p className="text-[#666666] dark:text-neutral-400 text-sm">Sign in to manage your site.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5 bg-white dark:bg-neutral-900 p-6 rounded border border-[#E5E7EB] dark:border-neutral-800">
                    <div>
                        <label className="block text-sm font-medium text-[#111111] dark:text-[#FFFFFF] mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-[#E5E7EB] dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-[#111111] dark:text-[#FFFFFF] transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#111111] dark:text-[#FFFFFF] mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-[#E5E7EB] dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-[#111111] dark:text-[#FFFFFF] transition-colors"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#111111] dark:bg-neutral-100 dark:text-neutral-900 text-white py-2.5 rounded font-medium hover:bg-[#2563EB] dark:hover:bg-blue-400 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                    {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                </form>
            </div>
        </div>
    )
}
