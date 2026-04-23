'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'

export default function AdminNav() {
    const pathname = usePathname()
    const router = useRouter()
    const [email, setEmail] = useState<string | null>(null)

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
    ]

    return (
        <div className="w-[220px] bg-[#F3F4F6] flex flex-col min-h-screen">
            <div className="p-4 border-b border-[#E5E7EB]">
                <Link href="/" className="text-sm font-medium text-[#111111] hover:text-[#2563EB]">
                    Alapakadala &#8594;
                </Link>
            </div>

            <nav className="flex-1 py-4">
                <ul className="space-y-1 px-2">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/admin')
                        return (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={`block px-3 py-2 rounded text-sm ${isActive
                                            ? 'bg-[#E5E7EB] font-bold text-[#111111]'
                                            : 'text-[#666666] hover:bg-gray-200 hover:text-[#111111]'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            <div className="p-4 border-t border-[#E5E7EB] text-sm">
                <div className="text-[#666666] truncate mb-2">{email || 'User'}</div>
                <button
                    onClick={handleSignOut}
                    className="text-[#666666] hover:text-red-600 hover:bg-red-50 px-2 py-1 -ml-2 rounded text-left transition-colors"
                >
                    Sign Out
                </button>
            </div>
        </div>
    )
}
