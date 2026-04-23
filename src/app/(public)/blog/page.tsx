import { createClient } from '@/lib/supabase/server'
import Container from '@/components/layout/Container'
import PostCard from '@/components/blog/PostCard'
import CategoryFilter from '@/components/blog/CategoryFilter'
import { Post, Category } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Blog',
    description: 'Writing by Alapakadala on Flutter and life.',
}

export default async function BlogPage() {
    const supabase = createClient()

    const { data: postsData } = await supabase
        .from('posts')
        .select(`
      id, title, slug, excerpt, cover_image_url, content, category_id,
      status, published_at, created_at, updated_at,
      categories(id, name, slug, created_at)
    `)
        .eq('status', 'published')
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
        <Container>
            <h1 className="text-[1.8rem] font-bold mb-6">Writing</h1>
            <CategoryFilter categories={categories} />
            {posts.length > 0 ? (
                posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))
            ) : (
                <p className="text-[#666666]">No posts yet.</p>
            )}
        </Container>
    )
}
