import { createPublicClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { LinkItem } from '@/lib/types'
import { ProfileBadge } from '@/components/ui/Badge'
import { ArrowUpRight } from 'lucide-react'
import { sanitizeUrl } from '@/lib/security'

export const revalidate = 60

export const metadata: Metadata = {
    title: 'Links | Amal Yulianto',
    description: 'All my important links in one place.',
}

export default async function LinksPage() {
    const supabase = createPublicClient()

    const { data: linksData } = await supabase
        .from('links')
        .select('*')
        .order('display_order', { ascending: true })

    const links: LinkItem[] = (linksData || [])
        .map((link) => {
            const safeUrl = sanitizeUrl(link.url, true)
            return safeUrl ? { ...link, url: safeUrl } : null
        })
        .filter((link): link is LinkItem => link !== null)

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="space-y-5">
                <h1 className="text-[32px] sm:text-[36px] font-bold tracking-tight text-foreground leading-tight m-0">
                    Important Links 🔗
                </h1>

                <ProfileBadge />

                <p className="text-sm sm:text-[15px] text-secondary leading-relaxed m-0">
                    I&apos;m Batman.
                </p>
            </header>

            <div className="space-y-4 pt-1">
                {links.length > 0 ? (
                    links.map((link) => (
                        <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between gap-4 py-1.5 no-underline transition-colors"
                        >
                            <span className="text-base sm:text-[17px] font-medium text-foreground group-hover:underline underline-offset-4 truncate">
                                {link.title}
                            </span>

                            <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-foreground transition-colors shrink-0" />
                        </a>
                    ))
                ) : (
                    <p className="text-sm text-muted py-4">
                        No links added yet.
                    </p>
                )}
            </div>
        </div>
    )
}
