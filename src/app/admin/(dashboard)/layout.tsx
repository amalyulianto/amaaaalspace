'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import AdminNav from '@/components/admin/AdminNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const checkUser = async () => {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            )
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser()

            const configuredAdminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '')
                .trim()
                .toLowerCase()

            const isAuthorized =
                !error &&
                Boolean(user) &&
                (!configuredAdminEmail || user?.email?.toLowerCase() === configuredAdminEmail)

            if (!isAuthorized) {
                if (user) {
                    await supabase.auth.signOut()
                }
                router.replace('/admin/login')
            } else {
                setLoading(false)
            }
        }

        checkUser()
    }, [router])

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background text-muted text-sm font-mono">
                Loading workspace...
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors flex flex-col md:flex-row">
            <AdminNav />
            <main className="flex-1 bg-background overflow-x-auto min-w-0">
                <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 md:p-10">
                    {children}
                </div>
            </main>
        </div>
    )
}
