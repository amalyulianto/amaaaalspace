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
        { name: 'Links', href: '/admin/links' },
    ]

    return (
        <div className="w-[240px] bg-white flex flex-col min-h-screen flex-shrink-0">
            <div className="p-8 pb-4">
                <Link href="/" className="text-[17px] tracking-tight font-bold text-[#111111] hover:text-[#2563EB] transition-colors">
                    Alapakadala <span className="opacity-50 font-normal">&rarr;</span>
                </Link>
            </div>

            <nav className="flex-1 py-4 px-6">
                <ul className="space-y-1">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/admin')
                        return (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={`block px-3 py-2 rounded-md text-[14px] transition-all font-medium ${isActive
                                        ? 'bg-[#F3F4F6] text-[#111111]'
                                        : 'text-[#666666] hover:bg-[#F9FAFB] hover:text-[#111111]'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            <div className="p-8 pt-4">
                <div className="text-[#666666] text-[13px] truncate mb-3">{email || 'User'}</div>
                <button
                    onClick={handleSignOut}
                    className="text-[#666666] hover:text-[#111111] text-[14px] font-medium block w-full text-left transition-colors"
                >
                    Sign Out &rarr;
                </button>
            </div>
        </div>
    )
}
