import { createClient } from '@/lib/supabase/server'
import Container from '@/components/layout/Container'
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
        <Container>
            <h1 className="text-[1.8rem] font-bold mb-8">Work</h1>
            {items.length > 0 ? (
                items.map((item) => (
                    <ProjectCard key={item.id} item={item} />
                ))
            ) : (
                <p className="text-[#666666]">No projects yet.</p>
            )}
        </Container>
    )
}
