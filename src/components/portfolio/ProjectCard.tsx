import Link from 'next/link'
import Image from 'next/image'
import { PortfolioItem } from '@/lib/types'
import { ExternalLink, Code, ArrowRight } from 'lucide-react'

interface ProjectCardProps {
    item: PortfolioItem
}

export default function ProjectCard({ item }: ProjectCardProps) {
    return (
        <div className="flex flex-col border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow group relative">
            {item.cover_image_url && (
                <div className="relative aspect-video w-full overflow-hidden border-b border-neutral-100">
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
                    <h2 className="text-xl font-bold mb-3 text-neutral-900">{item.title}</h2>
                </Link>
                {item.description && (
                    <p className="text-neutral-600 leading-relaxed mb-6 flex-grow whitespace-pre-wrap">
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
                                    <span
                                        key={tech}
                                        className="px-2.5 py-1 bg-neutral-100 text-neutral-700 text-xs font-medium rounded-md"
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-neutral-100">
                        <div className="flex items-center gap-4">
                            {item.project_url && (
                                <a
                                    href={item.project_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors no-underline z-10 relative"
                                >
                                    <ExternalLink className="w-4 h-4" /> Live Demo
                                </a>
                            )}
                            {item.github_url && (
                                <a
                                    href={item.github_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors no-underline z-10 relative"
                                >
                                    <Code className="w-4 h-4" /> Source
                                </a>
                            )}
                        </div>
                        <Link
                            href={`/portfolio/${item.slug}`}
                            className="inline-flex items-center gap-1 text-sm font-medium text-neutral-900 hover:opacity-70 transition-opacity no-underline z-10 relative"
                        >
                            Read details <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Absolute overlay link covering the card except footer buttons mapping above */}
            <Link href={`/portfolio/${item.slug}`} className="absolute inset-0 z-0 opacity-0" aria-label={`Read more about ${item.title}`} />
        </div>
    )
}
