import Link from 'next/link'
import { Post } from '@/lib/types'

interface PostCardProps {
    post: Post
}

export default function PostCard({ post }: PostCardProps) {
    return (
        <article className="group">
            <Link href={`/blog/${post.slug}`} className="block space-y-2 no-underline">
                <div className="flex items-center gap-3 text-sm mb-1">
                    <time className="text-neutral-500 tabular-nums">
                        {new Date(post.published_at || "").toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric"
                        })}
                    </time>
                    {post.category && (
                        <>
                            <span className="w-1 h-1 rounded-full bg-neutral-300"></span>
                            <span className="text-neutral-600 capitalize">{post.category.name}</span>
                        </>
                    )}
                </div>
                <h2 className="text-xl font-medium group-hover:text-blue-600 transition-colors text-neutral-900 m-0">
                    {post.title}
                </h2>
                {post.excerpt && (
                    <p className="text-neutral-600 leading-relaxed max-w-2xl m-0">
                        {post.excerpt}
                    </p>
                )}
            </Link>
        </article>
    )
}
