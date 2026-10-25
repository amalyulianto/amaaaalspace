import { createPublicClient } from '@/lib/supabase/server'
import PostCard from '@/components/blog/PostCard'
import CategoryFilter from '@/components/blog/CategoryFilter'
import { T } from '@/components/layout/ThemeProvider'
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
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="space-y-5">
                <h1 className="text-[32px] sm:text-[36px] font-bold tracking-tight text-foreground leading-tight m-0">
                    <T section="blog" k="title" />
                </h1>

                <p className="text-sm sm:text-[15px] text-secondary leading-relaxed m-0">
                    <T section="blog" k="subtitle" />
                </p>

                <div className="pt-1">
                    <CategoryFilter categories={categories} />
                </div>
            </header>

            <div className="space-y-4 pt-1">
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))
                ) : (
                    <p className="text-sm text-muted py-4">
                        <T section="blog" k="empty" />
                    </p>
                )}
            </div>
        </div>
    )
}
