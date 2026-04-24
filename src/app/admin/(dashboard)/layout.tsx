'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import AdminNav from '@/components/admin/AdminNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const checkSession = async () => {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            )
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                router.push('/admin/login')
            } else {
                setLoading(false)
            }
        }

        checkSession()
    }, [router])

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white">
                <p className="text-[#666666]">Loading...</p>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-white dark:bg-[#111111] text-[#111111] dark:text-[#FFFFFF]">
            <AdminNav />
            <main className="flex-1 border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 overflow-x-auto min-w-0">
                <div className="w-full p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
