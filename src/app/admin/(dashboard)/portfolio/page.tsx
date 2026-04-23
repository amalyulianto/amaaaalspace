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
                category:categories(id, name, slug)
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
        <div>
            <div className="flex justify-between items-end mb-8 border-b border-[#E5E7EB] pb-4">
                <h1 className="text-xl font-bold text-[#111111]">Portfolio</h1>
                <Link
                    href="/admin/portfolio/new"
                    className="text-[#111111] hover:text-[#2563EB] text-[15px] font-medium transition-colors"
                >
                    + New Project
                </Link>
            </div>

            {loading ? (
                <div className="py-12 text-[#666666] animate-pulse">Loading portfolio...</div>
            ) : (
                <div className="bg-white border-y sm:border border-[#E5E7EB] sm:rounded overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F3F4F6] border-b border-[#E5E7EB] text-[13px] uppercase tracking-wider text-[#666666]">
                                <th className="px-4 py-3 font-medium">Title</th>
                                <th className="px-4 py-3 font-medium">Category</th>
                                <th className="px-4 py-3 font-medium">Tech Stack</th>
                                <th className="px-4 py-3 font-medium">Order</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E7EB]">
                            {items.map(item => (
                                <tr key={item.id} className="hover:bg-[#F9FAFB] text-[15px] transition-colors">
                                    <td className="px-4 py-3.5 text-[#111111] font-medium">{item.title}</td>
                                    <td className="px-4 py-3.5 text-[#666666]">{item.category?.name || '—'}</td>
                                    <td className="px-4 py-3.5 text-[#666666]">
                                        {item.tech_stack?.join(', ') || '—'}
                                    </td>
                                    <td className="px-4 py-3.5 text-[#666666]">{item.display_order}</td>
                                    <td className="px-4 py-3.5 text-right space-x-3">
                                        <Link href={`/admin/portfolio/${item.id}/edit`} className="text-[#2563EB] hover:text-[#111111] transition-colors">
                                            Edit
                                        </Link>
                                        <button onClick={() => handleDelete(item.id)} className="text-[#666666] hover:text-red-600 transition-colors">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-[#666666]">
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
