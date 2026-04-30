import { createPublicClient } from '@/lib/supabase/server'
import ProjectCard from '@/components/portfolio/ProjectCard'
import { PortfolioItem } from '@/lib/types'
import type { Metadata } from 'next'
import { SectionHeading } from '@/components/ui/SectionHeading'
import CategoryFilter from '@/components/portfolio/CategoryFilter'
import { PortfolioCategory } from '@/lib/types'

export const revalidate = 60;

export const metadata: Metadata = {
    title: 'Portfolio',
    description: 'Projects built by Alapakadala.',
}

export default async function PortfolioPage({ searchParams }: { searchParams: { category?: string } }) {
    const supabase = createPublicClient()
    const activeSlug = searchParams.category

    const { data } = await supabase
        .from('portfolio')
        .select(`
            *,
            portfolio_categories!portfolio_category_mapping(id, name, slug)
        `)
        .order('display_order', { ascending: true })

    const { data: categoriesData } = await supabase
        .from('portfolio_categories')
        .select('*')
        .order('name', { ascending: true })

    let items: PortfolioItem[] = data ?? []
    const categories: PortfolioCategory[] = categoriesData ?? []

    if (activeSlug) {
        items = items.filter(item =>
            item.portfolio_categories?.some((cat: any) => cat.slug === activeSlug)
        )
    }

    const selectedItems = items.filter(i => i.is_selected)
    const otherItems = items.filter(i => !i.is_selected)

    const groupedItems: Record<string, PortfolioItem[]> = {}

    if (selectedItems.length > 0) {
        groupedItems['Highlighted Karya'] = selectedItems
    }

    if (otherItems.length > 0) {
        groupedItems['Karya Lainnya'] = otherItems
    }

    const sortedGroups = Object.entries(groupedItems)

    return (
        <div className="space-y-2 animate-in fade-in duration-500">
            <header className="space-y-4 border-b border-neutral-100 dark:border-neutral-800 pb-8">
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Karya</h1>
                <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl">
                    Karya-karya yang pernah dibuat yang berani dipublikasikan. Tidak semua bagus, tapi ada yang bagus, kok...
                </p>

                <div className="pt-4">
                    <CategoryFilter categories={categories} activeSlug={activeSlug} />
                </div>
            </header>

            <div className="space-y-8">
                {sortedGroups.length > 0 ? (
                    sortedGroups.map(([categoryName, categoryItems]) => (
                        <section key={categoryName}>
                            <SectionHeading className="border-b border-neutral-100 dark:border-neutral-800 pb-2">
                                {categoryName}
                            </SectionHeading>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {categoryItems.map((item) => (
                                    <ProjectCard key={item.id} item={item} />
                                ))}
                            </div>
                        </section>
                    ))
                ) : (
                    <p className="text-neutral-500 dark:text-neutral-400">Belum ada karya.</p>
                )}
            </div>
        </div>
    )
}
