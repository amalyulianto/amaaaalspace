import Link from 'next/link'
import { PortfolioItem } from '@/lib/types'

interface ProjectCardProps {
    item: PortfolioItem
}

export default function ProjectCard({ item }: ProjectCardProps) {
    const categoryText =
        item.portfolio_categories && item.portfolio_categories.length > 0
            ? item.portfolio_categories.map((cat) => cat.name.toLowerCase()).join(', ')
            : ''

    return (
        <article className="group">
            <Link
                href={`/portfolio/${item.slug}`}
                className="-mx-3 px-3 py-2.5 rounded-xl flex items-center justify-between gap-4 border border-transparent hover:bg-surface/70 hover:border-border no-underline transition-all duration-200"
            >
                <div className="min-w-0">
                    <h3 className="text-base sm:text-[17px] font-medium text-foreground group-hover:translate-x-0.5 transition-transform duration-200 leading-snug truncate m-0">
                        {item.title}
                    </h3>
                    {item.description && (
                        <p className="text-sm sm:text-[14px] text-muted leading-snug mt-1 truncate m-0">
                            {item.description}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {categoryText && (
                        <span className="text-xs text-muted group-hover:text-secondary transition-colors duration-200">
                            {categoryText}
                        </span>
                    )}
                    <span className="text-xs font-mono text-muted opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-foreground transition-all duration-200">
                        &rarr;
                    </span>
                </div>
            </Link>
        </article>
    )
}
