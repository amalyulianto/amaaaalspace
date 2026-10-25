'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { PortfolioItem } from '@/lib/types'

export default function AdminPortfolioPage() {
    const [items, setItems] = useState<PortfolioItem[]>([])
    const [loading, setLoading] = useState(true)

    const fetchItems = async () => {
        setLoading(true)
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data } = await supabase
            .from('portfolio')
            .select(`
                *,
                portfolio_categories!portfolio_category_mapping(id, name, slug)
            `)
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false })

        if (data) setItems(data as unknown as PortfolioItem[])
        setLoading(false)
    }

    useEffect(() => {
        fetchItems()
    }, [])

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this portfolio item?')) return

        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { error } = await supabase.from('portfolio').delete().eq('id', id)
        if (!error) fetchItems()
        else alert('Failed to delete item.')
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 border-b border-border pb-5">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Portfolio 🪄
                    </h1>
                    <p className="text-xs sm:text-sm text-secondary">
                        Manage your published works, categories, and display order.
                    </p>
                </div>
                <Link
                    href="/admin/portfolio/new"
                    className="inline-flex items-center justify-center bg-foreground text-background hover:opacity-90 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-opacity no-underline self-start sm:self-auto"
                >
                    + New Project
                </Link>
            </div>

            {loading ? (
                <div className="py-12 text-muted text-sm font-mono animate-pulse">
                    Loading portfolio...
                </div>
            ) : (
                <div className="bg-surface/20 border border-border rounded-xl overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-surface/70 border-b border-border text-xs font-mono uppercase tracking-wider text-muted">
                                <th className="px-4 py-3 font-medium">Title</th>
                                <th className="px-4 py-3 font-medium">Category</th>
                                <th className="px-4 py-3 font-medium">Tech Stack</th>
                                <th className="px-4 py-3 font-medium">Order</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {items.map((item) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-surface/50 transition-colors"
                                >
                                    <td className="px-4 py-3.5 text-foreground font-medium">
                                        <span>{item.title}</span>
                                        {item.is_selected && (
                                            <span className="ml-2 inline-block px-2 py-0.5 bg-surface text-foreground border border-border text-[11px] rounded-md font-medium">
                                                ⭐ Highlighted
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3.5 text-secondary text-xs sm:text-sm">
                                        {item.portfolio_categories?.map((c) => c.name).join(', ') || (
                                            <span className="text-muted">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3.5 text-secondary text-xs">
                                        {item.tech_stack?.join(', ') || (
                                            <span className="text-muted">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3.5 text-muted font-mono text-xs">
                                        {item.display_order}
                                    </td>
                                    <td className="px-4 py-3.5 text-right space-x-3 text-xs sm:text-sm whitespace-nowrap">
                                        <Link
                                            href={`/admin/portfolio/${item.id}/edit`}
                                            className="text-foreground hover:underline underline-offset-4 font-medium transition-colors"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-muted hover:text-red-500 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-10 text-center text-muted text-sm"
                                    >
                                        No portfolio items found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
