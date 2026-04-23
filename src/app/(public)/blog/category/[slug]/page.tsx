import { createClient } from '@/lib/supabase/server'
import Container from '@/components/layout/Container'
import PostCard from '@/components/blog/PostCard'
import CategoryFilter from '@/components/blog/CategoryFilter'
import { Post, Category } from '@/lib/types'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface PageProps {
    params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const supabase = createClient()
    const { data } = await supabase
        .from('categories')
        .select('name')
        .eq('slug', params.slug)
        .single()

    if (!data) return { title: 'Category' }
    return {
        title: `${data.name} — Posts`,
        description: `Posts in ${data.name}`,
    }
}

export default async function CategoryPage({ params }: PageProps) {
    const supabase = createClient()

    const { data: categoryData } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', params.slug)
        .single()

    if (!categoryData) notFound()

    const category: Category = categoryData

    const { data: postsData } = await supabase
        .from('posts')
        .select(`
      id, title, slug, excerpt, cover_image_url, content, category_id,
      status, published_at, created_at, updated_at,
      categories(id, name, slug, created_at)
    `)
        .eq('status', 'published')
        .eq('category_id', category.id)
        .order('published_at', { ascending: false })

    const { data: allCategoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

    const posts: Post[] = (postsData ?? []).map((p) => ({
        ...p,
        category: Array.isArray(p.categories) ? p.categories[0] : (p.categories ?? undefined),
    }))

    const allCategories: Category[] = allCategoriesData ?? []

    return (
        <Container>
            <h1 className="text-[1.8rem] font-bold mb-6">Category: {category.name}</h1>
            <CategoryFilter categories={allCategories} activeSlug={params.slug} />
            {posts.length > 0 ? (
                posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))
            ) : (
                <p className="text-[#666666]">No posts in this category yet.</p>
            )}
        </Container>
    )
}
