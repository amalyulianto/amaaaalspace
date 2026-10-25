import { createPublicClient } from '@/lib/supabase/server'
import ProjectCard from '@/components/portfolio/ProjectCard'
import { PortfolioItem, PortfolioCategory } from '@/lib/types'
import type { Metadata } from 'next'
import CategoryFilter from '@/components/portfolio/CategoryFilter'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { T } from '@/components/layout/ThemeProvider'

export const revalidate = 60

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
        items = items.filter((item) =>
            item.portfolio_categories?.some((cat) => cat.slug === activeSlug)
        )
    }

    const selectedItems = items.filter((i) => i.is_selected)
    const otherItems = items.filter((i) => !i.is_selected)

    const groupedItems: { titleKey: 'highlighted' | 'others'; items: PortfolioItem[] }[] = []

    if (selectedItems.length > 0) {
        groupedItems.push({ titleKey: 'highlighted', items: selectedItems })
    }

    if (otherItems.length > 0) {
        groupedItems.push({ titleKey: 'others', items: otherItems })
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="space-y-5">
                <h1 className="text-[32px] sm:text-[36px] font-bold tracking-tight text-foreground leading-tight m-0">
                    <T section="portfolio" k="title" />
                </h1>

                <p className="text-sm sm:text-[15px] text-secondary leading-relaxed m-0">
                    <T section="portfolio" k="subtitle" />
                </p>

                <div className="pt-1">
                    <CategoryFilter categories={categories} activeSlug={activeSlug} />
                </div>
            </header>

            <div className="space-y-8 pt-1">
                {groupedItems.length > 0 ? (
                    groupedItems.map((group) => (
                        <section key={group.titleKey} className="space-y-3">
                            <SectionHeading>
                                <T section="portfolio" k={group.titleKey} />
                            </SectionHeading>
                            <div className="space-y-1.5">
                                {group.items.map((item) => (
                                    <ProjectCard key={item.id} item={item} />
                                ))}
                            </div>
                        </section>
                    ))
                ) : (
                    <p className="text-sm text-muted py-4">
                        <T section="portfolio" k="empty" />
                    </p>
                )}
            </div>
        </div>
    )
}
