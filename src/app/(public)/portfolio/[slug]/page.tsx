import { createPublicClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowUpRight } from 'lucide-react'
import { T } from '@/components/layout/ThemeProvider'
import { sanitizeHtml, sanitizeUrl } from '@/lib/security'

export const revalidate = 60

type Props = {
    params: { slug: string }
}

export async function generateStaticParams() {
    const supabase = createPublicClient()
    const { data: items } = await supabase
        .from('portfolio')
        .select('slug')

    return items?.map((item) => ({
        slug: item.slug,
    })) || []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const supabase = createPublicClient()
    const { data: item } = await supabase
        .from('portfolio')
        .select('title, description')
        .eq('slug', params.slug)
        .single()

    return {
        title: item?.title || 'Project Not Found',
        description: item?.description || '',
    }
}

export default async function PortfolioDetailPage({ params }: Props) {
    const supabase = createPublicClient()

    const { data: item } = await supabase
        .from('portfolio')
        .select(`
            *,
            portfolio_categories!portfolio_category_mapping(id, name, slug)
        `)
        .eq('slug', params.slug)
        .single()

    if (!item) {
        notFound()
    }

    const categoriesText =
        item.portfolio_categories && item.portfolio_categories.length > 0
            ? item.portfolio_categories.map((cat: { name: string }) => cat.name.toLowerCase()).join(', ')
            : ''

    const techText =
        item.tech_stack && item.tech_stack.length > 0
            ? item.tech_stack.join(', ')
            : ''

    const externalLinks = [
        { label: 'Public Link', url: sanitizeUrl(item.project_url) },
        { label: 'Play Store', url: sanitizeUrl(item.play_store_url) },
        { label: 'Apple Store', url: sanitizeUrl(item.app_store_url) },
        { label: 'GitHub', url: sanitizeUrl(item.github_url) },
    ].filter((link): link is { label: string; url: string } => Boolean(link.url))

    const safeCoverImageUrl = sanitizeUrl(item.cover_image_url)
    const safeHtmlContent = sanitizeHtml(item.content)

    return (
        <article className="space-y-8 animate-in fade-in duration-500">
            <header className="space-y-3 border-b border-border pb-6">
                <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight text-foreground leading-tight m-0">
                    {item.title}
                </h1>

                {item.description && (
                    <p className="text-sm sm:text-[15px] text-secondary leading-relaxed m-0">
                        {item.description}
                    </p>
                )}

                <div className="space-y-1.5 pt-1 text-xs text-muted">
                    {categoriesText && (
                        <div>
                            <span className="text-secondary font-medium">
                                <T section="portfolio" k="categoryLabel" />
                            </span>{' '}
                            <span>{categoriesText}</span>
                        </div>
                    )}
                    {techText && (
                        <div>
                            <span className="text-secondary font-medium">
                                <T section="portfolio" k="techStackLabel" />
                            </span>{' '}
                            <span>{techText}</span>
                        </div>
                    )}
                </div>

                {externalLinks.length > 0 && (
                    <div className="flex flex-wrap items-center gap-5 pt-2">
                        {externalLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs sm:text-[13px] font-medium text-foreground hover:opacity-75 underline underline-offset-4 transition-opacity"
                            >
                                <span>{link.label}</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                        ))}
                    </div>
                )}
            </header>

            {safeCoverImageUrl && (
                <figure className="rounded-xl overflow-hidden bg-surface border border-border aspect-video relative m-0">
                    <img
                        src={safeCoverImageUrl}
                        alt={`Cover for ${item.title}`}
                        className="w-full h-full object-cover"
                    />
                </figure>
            )}

            {safeHtmlContent ? (
                <div
                    className="prose prose-neutral dark:prose-invert max-w-none text-sm sm:text-[15px] leading-[1.8] text-secondary prose-p:text-sm sm:prose-p:text-[15px] prose-p:leading-[1.8] prose-p:text-secondary prose-headings:tracking-tight prose-headings:font-bold prose-headings:text-foreground prose-h2:text-lg sm:prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-base sm:prose-h3:text-[17px] prose-h3:mt-6 prose-h3:mb-2 prose-li:text-sm sm:prose-li:text-[15px] prose-li:leading-[1.8] prose-li:text-secondary prose-a:text-foreground prose-a:underline prose-a:underline-offset-4 prose-strong:text-foreground prose-blockquote:text-sm sm:prose-blockquote:text-[15px] prose-blockquote:not-italic prose-blockquote:text-muted prose-blockquote:border-border prose-img:rounded-xl prose-img:border prose-img:border-border prose-img:bg-surface"
                    dangerouslySetInnerHTML={{ __html: safeHtmlContent }}
                />
            ) : (
                <p className="text-sm text-muted py-4">
                    <T section="portfolio" k="noDescription" />
                </p>
            )}
        </article>
    )
}
