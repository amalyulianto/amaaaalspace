import { createPublicClient } from '@/lib/supabase/server'
import PostCard from '@/components/blog/PostCard'
import CategoryFilter from '@/components/blog/CategoryFilter'
import { Post, Category } from '@/lib/types'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const revalidate = 60;

type Props = {
    params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const supabase = createPublicClient()
    const { data: category } = await supabase
        .from('categories')
        .select('name')
        .eq('slug', params.slug)
        .single()

    return {
        title: category ? `Writing in ${category.name}` : 'Category Not Found',
        description: `Posts categorized under ${category?.name}`,
    }
}

export default async function CategoryPage({ params }: Props) {
    const supabase = createPublicClient()

    const { data: category } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', params.slug)
        .single()

    if (!category) {
        notFound()
    }

    const { data: postsData } = await supabase
        .from('posts')
        .select(`
      id, title, slug, excerpt, cover_image_url, content, category_id,
      status, published_at, created_at, updated_at,
      categories(id, name, slug, created_at)
    `)
        .eq('status', 'published')
        .eq('category_id', category.id)
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false })

    const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

    const posts: Post[] = (postsData ?? []).map((p) => ({
        ...p,
        category: Array.isArray(p.categories) ? p.categories[0] : (p.categories ?? undefined),
    }))

    const allCategories: Category[] = categoriesData ?? []

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            <header className="space-y-4 border-b border-neutral-100 pb-8">
                <h1 className="text-3xl font-bold tracking-tight">
                    Tulisan: {category.name}
                </h1>
                <p className="text-lg text-neutral-600 max-w-2xl">
                    Blog pribadi. Setiap tulisannya dihasilkan setiap kurasa ingin menulis, dan diunggah kalau ingin diunggah. Tentang apa saja.
                </p>

                <div className="pt-4">
                    <CategoryFilter categories={allCategories} activeSlug={params.slug} />
                </div>
            </header>

            <div className="space-y-12">
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))
                ) : (
                    <p className="text-neutral-500">No posts found in this category.</p>
                )}
            </div>
        </div>
    )
}
