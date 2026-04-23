import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Container from '@/components/layout/Container'
import CommentList from '@/components/blog/CommentList'
import CommentForm from '@/components/blog/CommentForm'
import { Post } from '@/lib/types'
import type { Metadata } from 'next'

interface PageProps {
    params: { slug: string }
}

function formatDate(dateString: string | null): string {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const supabase = createClient()
    const { data } = await supabase
        .from('posts')
        .select('title, excerpt, cover_image_url, slug, categories(name, slug)')
        .eq('slug', params.slug)
        .eq('status', 'published')
        .single()

    if (!data) return { title: 'Post not found' }

    const description = data.excerpt ?? 'A post by Alapakadala'
    return {
        title: data.title,
        description,
        openGraph: {
            title: data.title,
            description,
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${data.slug}`,
            images: data.cover_image_url ? [{ url: data.cover_image_url, width: 1200, height: 630 }] : [],
        },
    }
}

export default async function BlogPostPage({ params }: PageProps) {
    const supabase = createClient()

    const { data: postData } = await supabase
        .from('posts')
        .select(`
      id, title, slug, excerpt, cover_image_url, content, category_id,
      status, published_at, created_at, updated_at,
      categories(id, name, slug, created_at)
    `)
        .eq('slug', params.slug)
        .eq('status', 'published')
        .limit(1)
        .single()

    if (!postData) notFound()

    const post: Post = {
        ...postData,
        category: Array.isArray(postData.categories)
            ? postData.categories[0]
            : (postData.categories ?? undefined),
    }

    return (
        <Container>
            <article>
                <header className="mb-8">
                    <h1 className="text-[1.8rem] font-bold leading-snug mb-3">{post.title}</h1>
                    <div className="flex items-center gap-3 text-[0.85rem] text-[#666666]">
                        <span>{formatDate(post.published_at)}</span>
                        {post.category && (
                            <>
                                <span>·</span>
                                <span>{post.category.name}</span>
                            </>
                        )}
                    </div>
                </header>

                {post.cover_image_url && (
                    <div className="mb-8">
                        <Image
                            src={post.cover_image_url}
                            alt={post.title}
                            width={680}
                            height={400}
                            className="w-full h-auto rounded"
                            priority
                        />
                    </div>
                )}

                {post.content && (
                    <div
                        className="prose-content leading-[1.7] text-[#111111]"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                )}
            </article>

            <hr className="border-gray-200 my-12" />

            <section>
                <h2 className="text-[1.1rem] font-semibold mb-6">Comments</h2>
                <CommentList postId={post.id} />
                <div className="mt-8">
                    <CommentForm postId={post.id} />
                </div>
            </section>
        </Container>
    )
}
