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
                className="flex items-center justify-between gap-4 py-1.5 no-underline transition-colors"
            >
                <div className="min-w-0">
                    <h3 className="text-base sm:text-[17px] font-medium text-foreground group-hover:underline underline-offset-4 leading-snug truncate m-0">
                        {item.title}
                    </h3>
                    {item.description && (
                        <p className="text-sm sm:text-[14px] text-muted leading-snug mt-1 truncate m-0">
                            {item.description}
                        </p>
                    )}
                </div>

                {categoryText && (
                    <span className="text-xs text-muted shrink-0">
                        {categoryText}
                    </span>
                )}
            </Link>
        </article>
    )
}
