import { createPublicClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Code } from 'lucide-react'
import type { Metadata } from 'next'
import { Badge } from '@/components/ui/Badge'

type Props = {
    params: { slug: string }
}

export async function generateStaticParams() {
    const supabase = createPublicClient()
    const { data: items } = await supabase
        .from('portfolio')
        .select('slug')

    return items?.map((item) => ({
        slug: item.slug,
    })) || []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const supabase = createPublicClient()
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
    const supabase = createPublicClient()

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
                className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 mb-8 transition-colors no-underline"
            >
                <ArrowLeft className="w-4 h-4" /> Kembali ke Karya
            </Link>

            <header className="mb-10 space-y-4 text-center">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 leading-tight">
                    {item.title}
                </h1>

                {item.description && (
                    <p className="text-xl text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto italic">
                        {item.description}
                    </p>
                )}

                <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                    {item.tech_stack && item.tech_stack.length > 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-2 mr-4">
                            {item.tech_stack.map((tech: string) => (
                                <Badge key={tech}>{tech}</Badge>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-4 border-l border-neutral-200 dark:border-neutral-800 pl-4">
                        {item.project_url && (
                            <a
                                href={item.project_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors no-underline"
                            >
                                <ExternalLink className="w-4 h-4" /> Live Demo
                            </a>
                        )}
                        {item.github_url && (
                            <a
                                href={item.github_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors no-underline"
                            >
                                <Code className="w-4 h-4" /> Kode Sumber
                            </a>
                        )}
                    </div>
                </div>
            </header>

            {item.cover_image_url && (
                <figure className="mb-12 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 aspect-video relative">
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
                    className="prose prose-neutral dark:prose-invert prose-lg max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:text-blue-500 dark:hover:prose-a:text-blue-300"
                    dangerouslySetInnerHTML={{ __html: item.content }}
                />
            ) : (
                <div className="text-center py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/50">
                    <p className="text-neutral-500 dark:text-neutral-400">Deskripsi belum diisi. Tunggu, ya!</p>
                </div>
            )}

            <hr className="my-16 border-neutral-200 dark:border-neutral-800" />

            <div className="flex justify-center">
                <Link
                    href="/portfolio"
                    className="inline-flex items-center justify-center px-6 py-2.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-medium text-sm rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors no-underline"
                >
                    Lihat semua karya
                </Link>
            </div>
        </article>
    )
}
