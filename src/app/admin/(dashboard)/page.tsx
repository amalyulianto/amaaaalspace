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
            <div className="py-12 text-muted text-sm font-mono animate-pulse">
                Loading dashboard data...
            </div>
        )
    }

    const statBoxes = [
        { label: 'Total Posts', value: stats.totalPosts, href: '/admin/posts' },
        { label: 'Published Posts', value: stats.publishedPosts, href: '/admin/posts' },
        { label: 'Pending Comments', value: stats.pendingComments, href: '/admin/comments' },
        { label: 'Pending Guestbook', value: stats.pendingGuestbook, href: '/admin/guestbook' },
    ]

    const quickLinks = [
        { name: 'Write New Post ✍️', desc: 'Create a new blog post or story', href: '/admin/posts/new' },
        { name: 'Add New Project 🪄', desc: 'Publish a new portfolio item', href: '/admin/portfolio/new' },
        { name: 'Manage Posts', desc: 'Edit or remove existing posts', href: '/admin/posts' },
        { name: 'Manage Portfolio', desc: 'Update projects & display order', href: '/admin/portfolio' },
        { name: 'Update Resume 📃', desc: 'Edit summary, experience & skills', href: '/admin/resume' },
        { name: 'Review Comments', desc: 'Approve or delete reader comments', href: '/admin/comments' },
        { name: 'Review Guestbook 📔', desc: 'Moderate visitor guestbook notes', href: '/admin/guestbook' },
        { name: 'Important Links 🔗', desc: 'Manage links on /links page', href: '/admin/links' },
        { name: 'Short Links', desc: 'Create custom short URLs', href: '/admin/short-links' },
    ]

    return (
        <div className="space-y-10 animate-in fade-in duration-300">
            <header className="space-y-1.5 border-b border-border pb-5">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Dashboard 👋🏼
                </h1>
                <p className="text-xs sm:text-sm text-secondary">
                    Overview of your content and pending moderation items.
                </p>
            </header>

            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statBoxes.map((box, i) => (
                    <Link
                        key={i}
                        href={box.href}
                        className="group bg-surface/40 hover:bg-surface border border-border rounded-xl p-5 transition-colors no-underline"
                    >
                        <div className="text-secondary text-xs font-medium mb-2 group-hover:text-foreground transition-colors">
                            {box.label}
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
                            {box.value}
                        </div>
                    </Link>
                ))}
            </section>

            <section className="space-y-4">
                <h2 className="text-xs font-mono uppercase tracking-wider text-muted">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {quickLinks.map((link, i) => (
                        <Link
                            key={i}
                            href={link.href}
                            className="group flex flex-col justify-between border border-border bg-surface/20 hover:bg-surface/70 hover:border-foreground/20 p-4 rounded-xl transition-all no-underline"
                        >
                            <div className="space-y-1">
                                <div className="text-sm font-semibold text-foreground flex items-center justify-between">
                                    <span>{link.name}</span>
                                    <span className="text-muted group-hover:text-foreground group-hover:translate-x-0.5 transition-all">
                                        &rarr;
                                    </span>
                                </div>
                                <p className="text-xs text-secondary leading-relaxed">
                                    {link.desc}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    )
}
