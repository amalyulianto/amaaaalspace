import { createPublicClient } from '@/lib/supabase/server'
import ProjectCard from '@/components/portfolio/ProjectCard'
import { PortfolioItem } from '@/lib/types'
import type { Metadata } from 'next'
import { SectionHeading } from '@/components/ui/SectionHeading'

export const revalidate = 60;

export const metadata: Metadata = {
    title: 'Portfolio',
    description: 'Projects built by Alapakadala.',
}

export default async function PortfolioPage() {
    const supabase = createPublicClient()

    const { data } = await supabase
        .from('portfolio')
        .select(`
            *,
            category:categories(id, name, slug)
        `)
        .order('display_order', { ascending: true })

    const items: PortfolioItem[] = data ?? []

    const groupedItems = items.reduce((acc, item) => {
        // Handle both single object and array responses from Supabase joins
        const categoryObj = Array.isArray(item.category) ? item.category[0] : item.category
        const categoryName = categoryObj?.name || 'Karya lainnya'

        if (!acc[categoryName]) acc[categoryName] = []
        acc[categoryName].push(item)
        return acc
    }, {} as Record<string, PortfolioItem[]>)

    // Optional: Sort groups so "Selected Projects" (if exists) is first
    const sortedGroups = Object.entries(groupedItems).sort(([a], [b]) => {
        if (a.toLowerCase() === 'selected projects') return -1
        if (b.toLowerCase() === 'selected projects') return 1
        return a.localeCompare(b)
    })

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            <header className="space-y-4 border-b border-neutral-100 dark:border-neutral-800 pb-8">
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Karya</h1>
                <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl">
                    Karya-karya yang pernah dibuat yang berani dipublikasikan. Tidak semua bagus, tapi ada yang bagus, kok...
                </p>
            </header>

            <div className="space-y-16">
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
