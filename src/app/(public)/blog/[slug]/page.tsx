import { createPublicClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import { CommentClient } from '@/components/blog/CommentClient'
import { Comment } from '@/lib/types'

export const revalidate = 60;

type Props = {
    params: { slug: string }
}

export async function generateStaticParams() {
    const supabase = createPublicClient()
    const { data: posts } = await supabase
        .from('posts')
        .select('slug')
        .eq('status', 'published')

    return posts?.map((post) => ({
        slug: post.slug,
    })) || []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const supabase = createPublicClient()
    const { data: post } = await supabase
        .from('posts')
        .select('title, excerpt')
        .eq('slug', params.slug)
        .single()

    return {
        title: post?.title || 'Post Not Found',
        description: post?.excerpt || '',
    }
}

export default async function BlogPostPage({ params }: Props) {
    const supabase = createPublicClient()

    // Fetch post with category
    const { data: postData } = await supabase
        .from('posts')
        .select(`
            *,
            categories (id, name, slug)
        `)
        .eq('slug', params.slug)
        .eq('status', 'published')
        .single()

    if (!postData) {
        notFound()
    }

    const category = Array.isArray(postData.categories) ? postData.categories[0] : postData.categories

    // Fetch comments
    const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postData.id)
        .eq('approved', true)
        .order('created_at', { ascending: true })

    const initialComments: Comment[] = commentsData ?? []

    return (
        <article className="animate-in fade-in duration-500 max-w-2xl mx-auto">
            <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 mb-8 transition-colors no-underline"
            >
                <ArrowLeft className="w-4 h-4" /> Kembali ke Tulisan
            </Link>

            <header className="mb-10 space-y-4 text-center">
                <div className="flex items-center justify-center gap-3 text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-6">
                    <time dateTime={postData.published_at || ''}>
                        {new Date(postData.published_at || '').toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric"
                        })}
                    </time>
                    {category && (
                        <>
                            <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                            <Link
                                href={`/blog/category/${category.slug}`}
                                className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors uppercase tracking-wider text-xs no-underline"
                            >
                                {category.name}
                            </Link>
                        </>
                    )}
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 leading-tight">
                    {postData.title}
                </h1>

                {postData.excerpt && (
                    <p className="text-xl text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto italic">
                        {postData.excerpt}
                    </p>
                )}
            </header>

            {postData.cover_image_url && (
                <figure className="mb-12 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 aspect-video relative">
                    <img
                        src={postData.cover_image_url}
                        alt={`Cover for ${postData.title}`}
                        className="w-full h-full object-cover"
                    />
                </figure>
            )}

            {/* Post Content */}
            {postData.content && (
                <div
                    className="prose prose-neutral dark:prose-invert prose-lg max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:text-blue-500 dark:hover:prose-a:text-blue-300"
                    dangerouslySetInnerHTML={{ __html: postData.content }}
                />
            )}

            <hr className="my-16 border-neutral-200 dark:border-neutral-800" />

            <CommentClient postId={postData.id} initialComments={initialComments} />
        </article>
    )
}
