'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { GuestbookEntry } from '@/lib/types'

export default function AdminGuestbookPage() {
    const [entries, setEntries] = useState<GuestbookEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')

    const fetchEntries = async () => {
        setLoading(true)
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data } = await supabase
            .from('guestbook')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) setEntries(data as GuestbookEntry[])
        setLoading(false)
    }

    useEffect(() => {
        fetchEntries()
    }, [])

    const handleApprove = async (id: string, currentStatus: boolean) => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { error } = await supabase.from('guestbook').update({ approved: !currentStatus }).eq('id', id)
        if (!error) fetchEntries()
        else alert('Failed to update status.')
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this entry?')) return
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { error } = await supabase.from('guestbook').delete().eq('id', id)
        if (!error) fetchEntries()
        else alert('Failed to delete entry.')
    }

    const filteredEntries = entries.filter(e => {
        if (filter === 'pending') return !e.approved
        if (filter === 'approved') return e.approved
        return true
    })

    return (
        <div>
            <div className="flex justify-between items-end mb-8 border-b border-[#E5E7EB] pb-4">
                <h1 className="text-xl font-bold text-[#111111]">Guestbook</h1>
            </div>

            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`pb-2 text-[15px] font-medium border-b-2 px-1 transition-colors ${filter === 'all' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-[#666666] hover:text-[#111111]'
                        }`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`pb-2 text-[15px] font-medium border-b-2 px-1 flex items-center gap-2 transition-colors ${filter === 'pending' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-[#666666] hover:text-[#111111]'
                        }`}
                >
                    Pending
                    {entries.filter(e => !e.approved).length > 0 && (
                        <span className="bg-[#111111] text-white text-[11px] px-2 py-0.5 rounded-full font-bold">
                            {entries.filter(e => !e.approved).length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setFilter('approved')}
                    className={`pb-2 text-[15px] font-medium border-b-2 px-1 transition-colors ${filter === 'approved' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-[#666666] hover:text-[#111111]'
                        }`}
                >
                    Approved
                </button>
            </div>

            {loading ? (
                <div className="py-12 text-[#666666] animate-pulse">Loading entries...</div>
            ) : (
                <div className="bg-white border-y sm:border border-[#E5E7EB] sm:rounded overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F3F4F6] border-b border-[#E5E7EB] text-[13px] uppercase tracking-wider text-[#666666]">
                                <th className="px-4 py-3 font-medium">Author</th>
                                <th className="px-4 py-3 font-medium">Message</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Date</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E7EB]">
                            {filteredEntries.map(e => (
                                <tr key={e.id} className="hover:bg-[#F9FAFB] text-[15px] transition-colors">
                                    <td className="px-4 py-3.5 text-[#111111] font-medium">{e.author_name}</td>
                                    <td className="px-4 py-3.5 text-[#666666] max-w-xs truncate" title={e.message}>
                                        {e.message}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${e.approved ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
                                            {e.approved ? 'Approved' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5 text-[#666666]">
                                        {new Date(e.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3.5 text-right space-x-3">
                                        <button
                                            onClick={() => handleApprove(e.id, e.approved)}
                                            className={e.approved ? 'text-[#666666] hover:text-[#111111] transition-colors' : 'text-[#2563EB] hover:text-[#111111] font-medium transition-colors'}
                                        >
                                            {e.approved ? 'Unapprove' : 'Approve'}
                                        </button>
                                        <button onClick={() => handleDelete(e.id)} className="text-[#666666] hover:text-red-600 transition-colors">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredEntries.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-[#666666]">
                                        No entries found.
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
