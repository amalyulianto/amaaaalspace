import Link from 'next/link'
import { PortfolioItem } from '@/lib/types'

interface ProjectCardProps {
    item: PortfolioItem
}

export default function ProjectCard({ item }: ProjectCardProps) {
    return (
        <article className="mb-8">
            <h2 className="text-[1.1rem] font-semibold mb-1">{item.title}</h2>
            {item.description && (
                <p className="text-[#666666] text-[0.95rem] leading-relaxed mb-2">
                    {item.description}
                </p>
            )}
            {item.tech_stack && item.tech_stack.length > 0 && (
                <p className="text-[0.8rem] text-[#666666] mb-2">
                    {item.tech_stack.join(', ')}
                </p>
            )}
            <div className="flex gap-4">
                {item.project_url && (
                    <Link
                        href={item.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-[0.9rem] no-underline hover:underline"
                    >
                        View project →
                    </Link>
                )}
                {item.github_url && (
                    <Link
                        href={item.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-[0.9rem] no-underline hover:underline"
                    >
                        GitHub →
                    </Link>
                )}
            </div>
        </article>
    )
}
