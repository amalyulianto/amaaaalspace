import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Container from '@/components/layout/Container'
import PostCard from '@/components/blog/PostCard'
import ProjectCard from '@/components/portfolio/ProjectCard'
import { Post, PortfolioItem } from '@/lib/types'

export default async function HomePage() {
    const supabase = createClient()

    const { data: postsData } = await supabase
        .from('posts')
        .select('id, title, slug, excerpt, published_at, category_id, cover_image_url, content, status, created_at, updated_at, categories(id, name, slug, created_at)')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(3)

    const { data: portfolioData } = await supabase
        .from('portfolio')
        .select('*')
        .order('display_order', { ascending: true })
        .limit(3)

    const posts: Post[] = (postsData ?? []).map((p) => ({
        ...p,
        category: Array.isArray(p.categories) ? p.categories[0] : (p.categories ?? undefined),
    }))

    const portfolioItems: PortfolioItem[] = portfolioData ?? []

    return (
        <Container>
            {/* Bio */}
            <section className="mb-12">
                <h1 className="text-[1.8rem] font-bold mb-4">Alapakadala</h1>
                <p className="text-[#666666] mb-4">
                    Flutter developer. I build mobile apps and write about software, life,
                    and whatever I find interesting.
                </p>
                <div className="flex gap-4">
                    <Link
                        href="https://github.com/alapakadala"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 no-underline hover:underline"
                    >
                        GitHub
                    </Link>
                    <Link
                        href="https://twitter.com/alapakadala"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 no-underline hover:underline"
                    >
                        Twitter
                    </Link>
                </div>
            </section>

            {/* Writing */}
            <section className="mb-12">
                <h2 className="text-[1.2rem] font-semibold mb-6">Writing</h2>
                {posts.length > 0 ? (
                    <>
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </>
                ) : (
                    <p className="text-[#666666]">No posts yet.</p>
                )}
                <Link href="/blog" className="text-blue-600 no-underline hover:underline text-[0.9rem]">
                    All posts →
                </Link>
            </section>

            {/* Work */}
            <section className="mb-12">
                <h2 className="text-[1.2rem] font-semibold mb-6">Work</h2>
                {portfolioItems.length > 0 ? (
                    <>
                        {portfolioItems.map((item) => (
                            <ProjectCard key={item.id} item={item} />
                        ))}
                    </>
                ) : (
                    <p className="text-[#666666]">No projects yet.</p>
                )}
                <Link href="/portfolio" className="text-blue-600 no-underline hover:underline text-[0.9rem]">
                    All projects →
                </Link>
            </section>
        </Container>
    )
}
