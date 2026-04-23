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
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-[#111111]">Guestbook</h1>
            </div>

            <div className="flex gap-4 border-b border-[#E5E7EB] mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`pb-2 text-sm font-medium border-b-2 px-1 ${filter === 'all' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-[#666666] hover:text-[#111111]'
                        }`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`pb-2 text-sm font-medium border-b-2 px-1 flex items-center gap-2 ${filter === 'pending' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-[#666666] hover:text-[#111111]'
                        }`}
                >
                    Pending
                    {entries.filter(e => !e.approved).length > 0 && (
                        <span className="bg-orange-100 text-orange-600 text-xs px-1.5 rounded-full">
                            {entries.filter(e => !e.approved).length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setFilter('approved')}
                    className={`pb-2 text-sm font-medium border-b-2 px-1 ${filter === 'approved' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-[#666666] hover:text-[#111111]'
                        }`}
                >
                    Approved
                </button>
            </div>

            {loading ? (
                <div className="text-[#666666]">Loading entries...</div>
            ) : (
                <div className="bg-white border border-[#E5E7EB] rounded overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F3F4F6] border-b border-[#E5E7EB] text-sm text-[#666666]">
                                <th className="px-4 py-3 font-medium">Author</th>
                                <th className="px-4 py-3 font-medium">Message</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Date</th>
                                <th className="px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEntries.map(e => (
                                <tr key={e.id} className="border-b border-[#E5E7EB] hover:bg-gray-50 text-sm">
                                    <td className="px-4 py-3 text-[#111111] font-medium">{e.author_name}</td>
                                    <td className="px-4 py-3 text-[#666666] max-w-xs truncate" title={e.message}>
                                        {e.message}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={e.approved ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}>
                                            {e.approved ? 'Approved' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-[#666666]">
                                        {new Date(e.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 space-x-3">
                                        <button
                                            onClick={() => handleApprove(e.id, e.approved)}
                                            className={e.approved ? 'text-gray-500 hover:underline' : 'text-green-600 hover:underline font-medium'}
                                        >
                                            {e.approved ? 'Unapprove' : 'Approve'}
                                        </button>
                                        <button onClick={() => handleDelete(e.id)} className="text-red-600 hover:underline">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredEntries.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-6 text-center text-[#666666]">
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
