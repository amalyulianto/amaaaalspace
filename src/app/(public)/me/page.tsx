'use client'

import Link from 'next/link'
import { ProfileBadge } from '@/components/ui/Badge'
import { useLanguage } from '@/components/layout/ThemeProvider'

export default function PersonalHomePage() {
    const { t } = useLanguage()

    const navItems = [
        { title: t.home.navHire, path: 'mailto:amal.yulianto@gmail.com' },
        { title: t.home.navBlog, path: '/blog' },
        { title: t.home.navPortfolio, path: '/portfolio' },
        { title: t.home.navResume, path: '/resume' },
        { title: t.home.navGuestbook, path: '/guestbook' },
        { title: t.home.navLinks, path: '/links' },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="space-y-5">
                <h1 className="text-[32px] sm:text-[38px] font-bold tracking-tight text-foreground leading-tight m-0">
                    {t.home.greeting}
                </h1>

                <ProfileBadge />

                <div className="space-y-4 text-base sm:text-[17px] text-secondary leading-relaxed">
                    <p>{t.home.bio1}</p>
                    <p>{t.home.bio2}</p>
                </div>
            </header>

            <nav className="pt-1">
                <ul className="space-y-1.5">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                href={item.path}
                                className="group -mx-3 px-3 py-2 rounded-xl flex items-center justify-between text-base sm:text-[17px] font-medium text-foreground border border-transparent hover:bg-surface/70 hover:border-border transition-all duration-200 no-underline"
                            >
                                <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                                    {item.title}
                                </span>
                                <span className="text-xs font-mono text-muted opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                                    &rarr;
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    )
}
