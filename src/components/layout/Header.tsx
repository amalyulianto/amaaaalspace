'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Container from './Container'

const navLinks = [
    { href: '/blog', label: 'Blog' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/resume', label: 'Resume' },
    { href: '/guestbook', label: 'Guestbook' },
]

export default function Header() {
    const pathname = usePathname()

    return (
        <header className="py-6 border-b border-gray-200 mb-8">
            <Container>
                <nav className="flex flex-wrap items-center justify-between gap-y-2">
                    <Link
                        href="/"
                        className="font-semibold text-[#111111] no-underline hover:no-underline"
                    >
                        Alapakadala
                    </Link>
                    <ul className="flex flex-wrap gap-x-6 list-none p-0 m-0">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
                            return (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className={`text-[#111111] no-underline hover:underline ${isActive ? 'font-bold' : 'font-normal'}`}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>
            </Container>
        </header>
    )
}
