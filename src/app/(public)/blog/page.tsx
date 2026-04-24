import { createPublicClient } from '@/lib/supabase/server'
import PostCard from '@/components/blog/PostCard'
import CategoryFilter from '@/components/blog/CategoryFilter'
import { Post, Category } from '@/lib/types'
import type { Metadata } from 'next'

export const revalidate = 60

export const metadata: Metadata = {
    title: 'Blog',
    description: 'Writing by Alapakadala on Flutter and life.',
}

export default async function BlogPage() {
    const supabase = createPublicClient()

    const { data: postsData } = await supabase
        .from('posts')
        .select(`
      id, title, slug, excerpt, cover_image_url, content, category_id,
      status, published_at, created_at, updated_at,
      categories(id, name, slug, created_at)
    `)
        .eq('status', 'published')
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

    const categories: Category[] = categoriesData ?? []

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            <header className="space-y-4 border-b border-neutral-100 dark:border-neutral-800 pb-8">
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Tulisan</h1>
                <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl">
                    Blog pribadi. Setiap tulisannya dihasilkan setiap kurasa ingin menulis, dan diunggah kalau ingin diunggah. Tentang apa saja.
                </p>

                <div className="pt-4">
                    <CategoryFilter categories={categories} />
                </div>
            </header>

            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))
                ) : (
                    <p className="text-neutral-500 dark:text-neutral-400 py-12">No posts found in this category.</p>
                )}
            </div>
        </div>
    )
}
