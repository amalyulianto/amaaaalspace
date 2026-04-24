import Link from 'next/link'
import Image from 'next/image'
import { PortfolioItem } from '@/lib/types'
import { ExternalLink, Code, ArrowRight } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'

interface ProjectCardProps {
    item: PortfolioItem
}

export default function ProjectCard({ item }: ProjectCardProps) {
    return (
        <Card className="flex flex-col group relative">
            {item.cover_image_url && (
                <div className="relative aspect-video w-full overflow-hidden border-b border-neutral-100 dark:border-neutral-800">
                    <Image
                        src={item.cover_image_url}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </div>
            )}
            <div className="p-6 flex flex-col flex-1">
                <Link href={`/portfolio/${item.slug}`} className="hover:opacity-75 transition-opacity">
                    <h2 className="text-xl font-bold mb-3 text-neutral-900 dark:text-neutral-100 uppercase">{item.title}</h2>
                </Link>
                {item.description && (
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6 flex-grow whitespace-pre-wrap">
                        {item.description}
                    </p>
                )}

                <div className="space-y-6 mt-auto">
                    {item.tech_stack && item.tech_stack.length > 0 && (
                        <div>
                            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                                Tech Stack
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {item.tech_stack.map((tech) => (
                                    <Badge key={tech}>{tech}</Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                        <div className="flex items-center gap-4">
                            {item.project_url && (
                                <a
                                    href={item.project_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors no-underline z-10 relative"
                                >
                                    <ExternalLink className="w-4 h-4" /> Live Demo
                                </a>
                            )}
                            {item.github_url && (
                                <a
                                    href={item.github_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors no-underline z-10 relative"
                                >
                                    <Code className="w-4 h-4" /> Source
                                </a>
                            )}
                        </div>
                        <Link
                            href={`/portfolio/${item.slug}`}
                            className="inline-flex items-center gap-1 text-sm font-medium text-neutral-900 dark:text-neutral-100 hover:opacity-70 transition-opacity no-underline z-10 relative"
                        >
                            Read details <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Absolute overlay link covering the card except footer buttons mapping above */}
            <Link href={`/portfolio/${item.slug}`} className="absolute inset-0 z-0 opacity-0" aria-label={`Read more about ${item.title}`} />
        </Card>
    )
}
