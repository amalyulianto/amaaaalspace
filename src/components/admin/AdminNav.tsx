'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

export default function AdminNav() {
    const pathname = usePathname()
    const router = useRouter()
    const [email, setEmail] = useState<string | null>(null)
    const [mobileOpen, setMobileOpen] = useState(false)

    useEffect(() => {
        const getEmail = async () => {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            )
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user?.email) {
                setEmail(session.user.email)
            }
        }
        getEmail()
    }, [])

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false)
    }, [pathname])

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [mobileOpen])

    const handleSignOut = async () => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        await supabase.auth.signOut()
        router.push('/admin/login')
    }

    const navLinks = [
        { name: 'Dashboard', href: '/admin' },
        { name: 'Posts', href: '/admin/posts' },
        { name: 'Portfolio', href: '/admin/portfolio' },
        { name: 'Resume', href: '/admin/resume' },
        { name: 'Comments', href: '/admin/comments' },
        { name: 'Guestbook', href: '/admin/guestbook' },
        { name: 'Links', href: '/admin/links' },
        { name: 'Short Links', href: '/admin/short-links' },
    ]

    return (
        <>
            {/* Mobile Top Header (< md) */}
            <div className="flex md:hidden items-center justify-between px-4 py-3 border-b border-border bg-surface/50 sticky top-0 z-40 backdrop-blur-md transition-colors">
                <Link
                    href="/me"
                    className="text-sm font-bold tracking-tight text-foreground no-underline"
                >
                    Amal&apos;s Space <span className="text-muted font-normal">&rarr;</span>
                </Link>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                        className="p-1.5 rounded-lg border border-border bg-surface text-secondary hover:text-foreground transition-colors"
                    >
                        {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 md:hidden backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setMobileOpen(false)}
                >
                    <div
                        className="fixed top-0 bottom-0 left-0 w-[260px] bg-background border-r border-border p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div>
                            <div className="flex items-center justify-between pb-4 border-b border-border">
                                <Link
                                    href="/me"
                                    onClick={() => setMobileOpen(false)}
                                    className="text-sm font-bold text-foreground no-underline"
                                >
                                    Amal&apos;s Space
                                </Link>
                                <button
                                    onClick={() => setMobileOpen(false)}
                                    aria-label="Close menu"
                                    className="p-1 text-muted hover:text-foreground rounded transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <nav className="py-4">
                                <ul className="space-y-1">
                                    {navLinks.map((link) => {
                                        const isActive =
                                            pathname === link.href ||
                                            (pathname.startsWith(link.href) && link.href !== '/admin')
                                        return (
                                            <li key={link.href}>
                                                <Link
                                                    href={link.href}
                                                    onClick={() => setMobileOpen(false)}
                                                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline ${
                                                        isActive
                                                            ? 'bg-surface text-foreground font-semibold border border-border'
                                                            : 'text-secondary hover:bg-surface/60 hover:text-foreground border border-transparent'
                                                    }`}
                                                >
                                                    {link.name}
                                                </Link>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </nav>
                        </div>

                        <div className="pt-4 border-t border-border space-y-2.5">
                            <div className="text-muted font-mono text-xs truncate" title={email || 'Admin'}>
                                {email || 'Admin'}
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="text-secondary hover:text-foreground text-xs font-medium block w-full text-left transition-colors"
                            >
                                Sign Out &rarr;
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Fixed Sidebar (md+) */}
            <aside className="hidden md:flex w-[220px] bg-surface/40 flex-col h-screen sticky top-0 flex-shrink-0 border-r border-border transition-colors justify-between">
                <div>
                    <div className="p-6 pb-4 flex items-center justify-between border-b border-border/60">
                        <Link
                            href="/me"
                            className="text-sm tracking-tight font-bold text-foreground hover:text-secondary transition-colors no-underline"
                        >
                            Amal&apos;s Space <span className="text-muted font-normal ml-0.5">&rarr;</span>
                        </Link>
                        <ThemeToggle />
                    </div>

                    <nav className="py-5 px-3">
                        <ul className="space-y-1">
                            {navLinks.map((link) => {
                                const isActive =
                                    pathname === link.href ||
                                    (pathname.startsWith(link.href) && link.href !== '/admin')
                                return (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className={`block px-3 py-2 rounded-lg text-xs sm:text-[13px] transition-colors no-underline ${
                                                isActive
                                                    ? 'bg-surface text-foreground font-semibold border border-border'
                                                    : 'text-secondary hover:bg-surface/60 hover:text-foreground font-medium border border-transparent'
                                            }`}
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </nav>
                </div>

                <div className="p-5 border-t border-border/60 space-y-2.5">
                    <div className="text-muted font-mono text-[11px] truncate" title={email || 'Admin'}>
                        {email || 'Admin'}
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="text-secondary hover:text-foreground text-xs font-medium block w-full text-left transition-colors"
                    >
                        Sign Out &rarr;
                    </button>
                </div>
            </aside>
        </>
    )
}
