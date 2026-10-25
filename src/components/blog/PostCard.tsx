'use client'

import Link from 'next/link'
import { Post } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { useLanguage } from '@/components/layout/ThemeProvider'

interface PostCardProps {
    post: Post
}

export default function PostCard({ post }: PostCardProps) {
    const { lang } = useLanguage()
    const formattedDate = formatDate(post.published_at, lang)

    return (
        <article className="group">
            <Link
                href={`/blog/${post.slug}`}
                className="-mx-3 px-3 py-2.5 rounded-xl flex items-center justify-between gap-4 border border-transparent hover:bg-surface/70 hover:border-border no-underline transition-all duration-200"
            >
                <div className="min-w-0">
                    <h2 className="text-base sm:text-[17px] font-medium text-foreground group-hover:translate-x-0.5 transition-transform duration-200 leading-snug truncate m-0">
                        {post.title}
                    </h2>
                    <div className="flex items-center gap-1.5 text-xs text-muted mt-1 tabular-nums">
                        <time dateTime={post.published_at || ''}>{formattedDate}</time>
                        {post.category && (
                            <>
                                <span>•</span>
                                <span className="capitalize">{post.category.name}</span>
                            </>
                        )}
                    </div>
                </div>
                <span className="text-xs font-mono text-muted opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-foreground transition-all duration-200 shrink-0">
                    &rarr;
                </span>
            </Link>
        </article>
    )
}
