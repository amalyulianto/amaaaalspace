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
        const { error } = await supabase
            .from('guestbook')
            .update({ approved: !currentStatus })
            .eq('id', id)
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

    const filteredEntries = entries.filter((e) => {
        if (filter === 'pending') return !e.approved
        if (filter === 'approved') return e.approved
        return true
    })

    const pendingCount = entries.filter((e) => !e.approved).length

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="border-b border-border pb-5 space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Guestbook 📔
                </h1>
                <p className="text-xs sm:text-sm text-secondary">
                    Review and moderate visitor entries on your guestbook wall.
                </p>
            </div>

            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        filter === 'all'
                            ? 'bg-surface text-foreground border border-border'
                            : 'text-muted hover:text-foreground border border-transparent'
                    }`}
                >
                    All ({entries.length})
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
                        filter === 'pending'
                            ? 'bg-surface text-foreground border border-border'
                            : 'text-muted hover:text-foreground border border-transparent'
                    }`}
                >
                    Pending
                    {pendingCount > 0 && (
                        <span className="bg-foreground text-background text-[10px] font-mono px-1.5 py-0.5 rounded-md font-bold leading-none">
                            {pendingCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setFilter('approved')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        filter === 'approved'
                            ? 'bg-surface text-foreground border border-border'
                            : 'text-muted hover:text-foreground border border-transparent'
                    }`}
                >
                    Approved
                </button>
            </div>

            {loading ? (
                <div className="py-12 text-muted text-sm font-mono animate-pulse">
                    Loading entries...
                </div>
            ) : (
                <div className="bg-surface/20 border border-border rounded-xl overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-surface/70 border-b border-border text-xs font-mono uppercase tracking-wider text-muted">
                                <th className="px-4 py-3 font-medium">Author</th>
                                <th className="px-4 py-3 font-medium">Message</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Date</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredEntries.map((e) => (
                                <tr
                                    key={e.id}
                                    className="hover:bg-surface/50 transition-colors"
                                >
                                    <td className="px-4 py-3.5 text-foreground font-medium whitespace-nowrap">
                                        {e.author_name}
                                    </td>
                                    <td
                                        className="px-4 py-3.5 text-secondary max-w-md truncate text-xs sm:text-sm"
                                        title={e.message}
                                    >
                                        {e.message}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${
                                                e.approved
                                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                                                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                                            }`}
                                        >
                                            {e.approved ? 'Approved' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5 text-muted font-mono text-xs whitespace-nowrap">
                                        {new Date(e.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3.5 text-right space-x-3 text-xs sm:text-sm whitespace-nowrap">
                                        <button
                                            onClick={() => handleApprove(e.id, e.approved)}
                                            className={
                                                e.approved
                                                    ? 'text-secondary hover:text-foreground transition-colors'
                                                    : 'text-foreground font-semibold hover:underline underline-offset-4 transition-colors'
                                            }
                                        >
                                            {e.approved ? 'Unapprove' : 'Approve'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(e.id)}
                                            className="text-muted hover:text-red-500 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredEntries.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-10 text-center text-muted text-sm"
                                    >
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
