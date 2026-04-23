import { createClient } from '@/lib/supabase/server'
import ProjectCard from '@/components/portfolio/ProjectCard'
import { PortfolioItem } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Portfolio',
    description: 'Projects built by Alapakadala.',
}

export default async function PortfolioPage() {
    const supabase = createClient()

    const { data } = await supabase
        .from('portfolio')
        .select('*')
        .order('display_order', { ascending: true })

    const items: PortfolioItem[] = data ?? []

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pt-4 md:pt-10">
            <header className="space-y-4 border-b border-neutral-100 pb-8">
                <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
                <p className="text-lg text-neutral-600 max-w-2xl">
                    Selected projects and experiments.
                </p>
            </header>

            <div className="space-y-12">
                {items.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {items.map((item) => (
                            <ProjectCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <p className="text-neutral-500">No projects yet.</p>
                )}
            </div>
        </div>
    )
}
