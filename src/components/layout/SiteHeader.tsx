"use client"

import { ThemeToggle } from './ThemeToggle'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function SiteHeader() {
    const pathname = usePathname()
    const isHome = pathname === '/'

    // Do not show on admin routes
    if (pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <header className="pt-8 pb-4 px-6 md:pt-10">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
                <Link href="/" className="text-xl font-bold tracking-tight hover:opacity-70 transition-all duration-300 ease-in-out no-underline text-neutral-900 dark:text-neutral-100">
                    Amal's space
                </Link>

                <div className="flex items-center gap-4">
                    {!isHome && (
                        <Link
                            href="/"
                            className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 flex items-center gap-1.5 transition-all duration-300 ease-in-out no-underline"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Ke Halaman Utama</span>
                        </Link>
                    )}
                    <ThemeToggle />
                </div>
            </div>
        </header>
    )
}
