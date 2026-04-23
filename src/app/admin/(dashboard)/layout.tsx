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
        <div className="flex min-h-screen">
            <AdminNav />
            <main className="flex-1 p-8 bg-white border-l border-[#E5E7EB]">
                {children}
            </main>
        </div>
    )
}
