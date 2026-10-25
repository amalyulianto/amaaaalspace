'use client'

import * as React from 'react'
import { ThemeToggle } from './ThemeToggle'
import Container from './Container'
import { useLanguage } from './ThemeProvider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function SiteHeader() {
    const pathname = usePathname()
    const { lang, setLang, t } = useLanguage()

    if (pathname.startsWith('/admin')) {
        return null
    }

    const isHome = pathname === '/' || pathname === '/me'
    const isBlogDetail = pathname.startsWith('/blog/') && !pathname.startsWith('/blog/category/')
    const isPortfolioDetail = pathname.startsWith('/portfolio/')

    let backHref = '/me'
    let backLabel: string = t.header.backToHome

    if (isBlogDetail) {
        backHref = '/blog'
        backLabel = t.header.backToWritings
    } else if (isPortfolioDetail) {
        backHref = '/portfolio'
        backLabel = t.header.backToWorks
    }

    return (
        <header className="pt-8 pb-3 md:pt-12 md:pb-4">
            <Container className="flex items-center justify-between gap-4">
                <div>
                    {!isHome && (
                        <Link
                            href={backHref}
                            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors no-underline group"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                            <span className="group-hover:underline underline-offset-4">{backLabel}</span>
                        </Link>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs tracking-wide select-none">
                        <button
                            type="button"
                            onClick={() => setLang('ID')}
                            className={`transition-colors ${
                                lang === 'ID'
                                    ? 'font-bold text-foreground underline underline-offset-4'
                                    : 'font-medium text-muted hover:text-foreground'
                            }`}
                        >
                            ID
                        </button>
                        <span className="text-border">|</span>
                        <button
                            type="button"
                            onClick={() => setLang('EN')}
                            className={`transition-colors ${
                                lang === 'EN'
                                    ? 'font-bold text-foreground underline underline-offset-4'
                                    : 'font-medium text-muted hover:text-foreground'
                            }`}
                        >
                            EN
                        </button>
                    </div>
                    <ThemeToggle />
                </div>
            </Container>
        </header>
    )
}
