import Link from 'next/link'
import { Post } from '@/lib/types'

interface PostCardProps {
    post: Post
}

function formatDate(dateString: string | null): string {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

export default function PostCard({ post }: PostCardProps) {
    return (
        <article className="mb-8">
            <div className="mb-1">
                {post.category && (
                    <span className="text-[0.8rem] text-[#666666] uppercase tracking-wide mr-3">
                        {post.category.name}
                    </span>
                )}
                <span className="text-[0.85rem] text-[#666666]">
                    {formatDate(post.published_at)}
                </span>
            </div>
            <h2 className="text-[1.1rem] font-semibold mb-1 leading-snug">
                <Link
                    href={`/blog/${post.slug}`}
                    className="text-[#111111] no-underline hover:underline"
                >
                    {post.title}
                </Link>
            </h2>
            {post.excerpt && (
                <p className="text-[#666666] text-[0.95rem] leading-relaxed m-0">
                    {post.excerpt}
                </p>
            )}
        </article>
    )
}
