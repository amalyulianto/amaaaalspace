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
                className="block py-1 no-underline transition-colors"
            >
                <h2 className="text-sm sm:text-[15px] font-medium text-foreground group-hover:underline underline-offset-4 leading-snug truncate m-0">
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
            </Link>
        </article>
    )
}
