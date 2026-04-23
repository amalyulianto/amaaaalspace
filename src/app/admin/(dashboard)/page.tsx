'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalPosts: 0,
        publishedPosts: 0,
        pendingComments: 0,
        pendingGuestbook: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            )

            const [postsRes, commentsRes, guestbookRes] = await Promise.all([
                supabase.from('posts').select('status', { count: 'exact' }),
                supabase.from('comments').select('id', { count: 'exact', head: true }).eq('approved', false),
                supabase.from('guestbook').select('id', { count: 'exact', head: true }).eq('approved', false),
            ])

            const totalPosts = postsRes.data?.length || 0
            const publishedPosts = postsRes.data?.filter(p => p.status === 'published').length || 0

            setStats({
                totalPosts,
                publishedPosts,
                pendingComments: commentsRes.count || 0,
                pendingGuestbook: guestbookRes.count || 0,
            })
            setLoading(false)
        }

        fetchStats()
    }, [])

    if (loading) {
        return (
            <div className="py-12 text-[#666666] animate-pulse">
                Loading dashboard data...
            </div>
        )
    }

    const statBoxes = [
        { label: 'Total Posts', value: stats.totalPosts },
        { label: 'Published Posts', value: stats.publishedPosts },
        { label: 'Pending Comments', value: stats.pendingComments },
        { label: 'Pending Guestbook', value: stats.pendingGuestbook },
    ]

    const quickLinks = [
        { name: 'New Post', href: '/admin/posts/new' },
        { name: 'Manage Posts', href: '/admin/posts' },
        { name: 'Manage Portfolio', href: '/admin/portfolio' },
        { name: 'Update Resume', href: '/admin/resume' },
        { name: 'Review Comments', href: '/admin/comments' },
        { name: 'Review Guestbook', href: '/admin/guestbook' },
    ]

    return (
        <div>
            <h1 className="text-xl font-bold text-[#111111] mb-8">Dashboard Overview</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                {statBoxes.map((box, i) => (
                    <div key={i} className="bg-white border border-[#E5E7EB] rounded p-5">
                        <div className="text-[#666666] text-sm mb-1">{box.label}</div>
                        <div className="text-2xl font-bold text-[#111111]">{box.value}</div>
                    </div>
                ))}
            </div>

            <h2 className="text-lg font-bold text-[#111111] mb-4">Quick Links</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {quickLinks.map((link, i) => (
                    <Link
                        key={i}
                        href={link.href}
                        className="block border border-[#E5E7EB] p-4 rounded text-[#111111] font-medium hover:bg-[#F3F4F6] hover:border-[#111111] transition-all"
                    >
                        {link.name} &#8594;
                    </Link>
                ))}
            </div>
        </div>
    )
}
