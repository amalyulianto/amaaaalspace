"use client"

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
        <header className="py-8 px-6">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
                <Link href="/" className="text-xl font-bold tracking-tight hover:opacity-70 transition-opacity no-underline text-neutral-900">
                    Alapakadala
                </Link>

                {!isHome && (
                    <Link
                        href="/"
                        className="text-sm font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-1.5 transition-colors no-underline"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Back to Home</span>
                    </Link>
                )}
            </div>
        </header>
    )
}
