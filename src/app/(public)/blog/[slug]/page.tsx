import { createPublicClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { CommentClient } from '@/components/blog/CommentClient'
import { LocalizedDate } from '@/components/layout/ThemeProvider'
import { Comment } from '@/lib/types'
import { sanitizeHtml, sanitizeUrl } from '@/lib/security'

export const revalidate = 60

type Props = {
    params: { slug: string }
}

export async function generateStaticParams() {
    const supabase = createPublicClient()
    const now = new Date().toISOString()
    const { data: posts } = await supabase
        .from('posts')
        .select('slug')
        .eq('status', 'published')
        .lte('published_at', now)

    return posts?.map((post) => ({
        slug: post.slug,
    })) || []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const supabase = createPublicClient()
    const now = new Date().toISOString()
    const { data: post } = await supabase
        .from('posts')
        .select('title, excerpt')
        .eq('slug', params.slug)
        .eq('status', 'published')
        .lte('published_at', now)
        .single()

    return {
        title: post?.title || 'Post Not Found',
        description: post?.excerpt || '',
    }
}

export default async function BlogPostPage({ params }: Props) {
    const supabase = createPublicClient()
    const now = new Date().toISOString()

    const { data: postData } = await supabase
        .from('posts')
        .select(`
            *,
            categories (id, name, slug)
        `)
        .eq('slug', params.slug)
        .eq('status', 'published')
        .lte('published_at', now)
        .single()

    if (!postData) {
        notFound()
    }

    const category = Array.isArray(postData.categories) ? postData.categories[0] : postData.categories

    const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postData.id)
        .eq('approved', true)
        .order('created_at', { ascending: true })

    const initialComments: Comment[] = commentsData ?? []
    const safeCoverImageUrl = sanitizeUrl(postData.cover_image_url)
    const safeHtmlContent = sanitizeHtml(postData.content)

    return (
        <article className="space-y-8 animate-in fade-in duration-500">
            <header className="space-y-3 border-b border-border pb-6">
                <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight text-foreground leading-tight m-0">
                    {postData.title}
                </h1>

                <div className="flex items-center gap-1.5 text-xs text-muted tabular-nums">
                    <time dateTime={postData.published_at || ''}>
                        <LocalizedDate date={postData.published_at} />
                    </time>
                    {category && (
                        <>
                            <span>•</span>
                            <Link
                                href={`/blog/category/${category.slug}`}
                                className="capitalize hover:text-foreground no-underline transition-colors"
                            >
                                {category.name}
                            </Link>
                        </>
                    )}
                </div>

                {postData.excerpt && (
                    <p className="text-sm sm:text-[15px] text-secondary leading-relaxed pt-1 m-0">
                        {postData.excerpt}
                    </p>
                )}
            </header>

            {safeCoverImageUrl && (
                <figure className="rounded-xl overflow-hidden bg-surface border border-border aspect-video relative m-0">
                    <img
                        src={safeCoverImageUrl}
                        alt={`Cover for ${postData.title}`}
                        className="w-full h-full object-cover"
                    />
                </figure>
            )}

            {safeHtmlContent && (
                <div
                    className="prose prose-neutral dark:prose-invert max-w-none text-sm sm:text-[15px] leading-[1.8] text-secondary prose-p:text-sm sm:prose-p:text-[15px] prose-p:leading-[1.8] prose-p:text-secondary prose-headings:tracking-tight prose-headings:font-bold prose-headings:text-foreground prose-h2:text-lg sm:prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-base sm:prose-h3:text-[17px] prose-h3:mt-6 prose-h3:mb-2 prose-li:text-sm sm:prose-li:text-[15px] prose-li:leading-[1.8] prose-li:text-secondary prose-a:text-foreground prose-a:underline prose-a:underline-offset-4 prose-strong:text-foreground prose-blockquote:text-sm sm:prose-blockquote:text-[15px] prose-blockquote:not-italic prose-blockquote:text-muted prose-blockquote:border-border prose-img:rounded-xl prose-img:border prose-img:border-border prose-img:bg-surface"
                    dangerouslySetInnerHTML={{ __html: safeHtmlContent }}
                />
            )}

            <hr className="border-border my-10" />

            <CommentClient postId={postData.id} initialComments={initialComments} />
        </article>
    )
}
