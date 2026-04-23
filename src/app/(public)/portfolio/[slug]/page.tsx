import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Code } from 'lucide-react'
import type { Metadata } from 'next'

type Props = {
    params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const supabase = createClient()
    const { data: item } = await supabase
        .from('portfolio')
        .select('title, description')
        .eq('slug', params.slug)
        .single()

    return {
        title: item?.title || 'Project Not Found',
        description: item?.description || '',
    }
}

export default async function PortfolioDetailPage({ params }: Props) {
    const supabase = createClient()

    // Fetch portfolio item
    const { data: item } = await supabase
        .from('portfolio')
        .select('*')
        .eq('slug', params.slug)
        .single()

    if (!item) {
        notFound()
    }

    return (
        <article className="animate-in fade-in duration-500 max-w-2xl mx-auto">
            <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 mb-8 transition-colors no-underline"
            >
                <ArrowLeft className="w-4 h-4" /> Back to portfolio
            </Link>

            <header className="mb-10 space-y-4 text-center">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 leading-tight">
                    {item.title}
                </h1>

                {item.description && (
                    <p className="text-xl text-neutral-500 max-w-xl mx-auto italic">
                        {item.description}
                    </p>
                )}

                <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                    {item.tech_stack && item.tech_stack.length > 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-2 mr-4">
                            {item.tech_stack.map((tech: string) => (
                                <span
                                    key={tech}
                                    className="px-2.5 py-1 bg-neutral-100 text-neutral-700 text-xs font-medium rounded-md uppercase tracking-wider"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-4 border-l border-neutral-200 pl-4">
                        {item.project_url && (
                            <a
                                href={item.project_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors no-underline"
                            >
                                <ExternalLink className="w-4 h-4" /> Live Demo
                            </a>
                        )}
                        {item.github_url && (
                            <a
                                href={item.github_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors no-underline"
                            >
                                <Code className="w-4 h-4" /> Source
                            </a>
                        )}
                    </div>
                </div>
            </header>

            {item.cover_image_url && (
                <figure className="mb-12 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 aspect-video relative">
                    <img
                        src={item.cover_image_url}
                        alt={`Cover for ${item.title}`}
                        className="w-full h-full object-cover"
                    />
                </figure>
            )}

            {/* Post Content */}
            {item.content ? (
                <div
                    className="prose prose-neutral prose-lg max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:text-blue-500"
                    dangerouslySetInnerHTML={{ __html: item.content }}
                />
            ) : (
                <div className="text-center py-12 border border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
                    <p className="text-neutral-500">More details about this project will be added soon.</p>
                </div>
            )}

            <hr className="my-16 border-neutral-200" />

            <div className="flex justify-center">
                <Link
                    href="/portfolio"
                    className="inline-flex items-center justify-center px-6 py-2.5 bg-neutral-900 text-white font-medium text-sm rounded-lg hover:bg-neutral-800 transition-colors no-underline"
                >
                    View All Projects
                </Link>
            </div>
        </article>
    )
}
