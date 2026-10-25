'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type CommentWithPost = {
    id: string
    post_id: string
    author_name: string
    content: string
    approved: boolean
    created_at: string
    post_title?: string
}

export default function AdminCommentsPage() {
    const [comments, setComments] = useState<CommentWithPost[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')

    const fetchComments = async () => {
        setLoading(true)
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data } = await supabase
            .from('comments')
            .select('*, posts(title)')
            .order('created_at', { ascending: false })

        if (data) {
            const formatted = data.map((c) => ({
                ...c,
                post_title: c.posts?.title,
            }))
            setComments(formatted as unknown as CommentWithPost[])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchComments()
    }, [])

    const handleApprove = async (id: string, currentStatus: boolean) => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { error } = await supabase
            .from('comments')
            .update({ approved: !currentStatus })
            .eq('id', id)
        if (!error) fetchComments()
        else alert('Failed to update status.')
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this comment?')) return
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { error } = await supabase.from('comments').delete().eq('id', id)
        if (!error) fetchComments()
        else alert('Failed to delete comment.')
    }

    const filteredComments = comments.filter((c) => {
        if (filter === 'pending') return !c.approved
        if (filter === 'approved') return c.approved
        return true
    })

    const pendingCount = comments.filter((c) => !c.approved).length

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="border-b border-border pb-5 space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Comments 💬
                </h1>
                <p className="text-xs sm:text-sm text-secondary">
                    Review, approve, or remove reader comments on your writings.
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
                    All ({comments.length})
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
                    Loading comments...
                </div>
            ) : (
                <div className="bg-surface/20 border border-border rounded-xl overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-surface/70 border-b border-border text-xs font-mono uppercase tracking-wider text-muted">
                                <th className="px-4 py-3 font-medium">Author</th>
                                <th className="px-4 py-3 font-medium">Post</th>
                                <th className="px-4 py-3 font-medium">Comment</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Date</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredComments.map((c) => (
                                <tr
                                    key={c.id}
                                    className="hover:bg-surface/50 transition-colors"
                                >
                                    <td className="px-4 py-3.5 text-foreground font-medium whitespace-nowrap">
                                        {c.author_name}
                                    </td>
                                    <td className="px-4 py-3.5 text-secondary text-xs max-w-[180px] truncate">
                                        {c.post_title || 'Unknown post'}
                                    </td>
                                    <td
                                        className="px-4 py-3.5 text-secondary max-w-xs truncate text-xs sm:text-sm"
                                        title={c.content}
                                    >
                                        {c.content}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${
                                                c.approved
                                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                                                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                                            }`}
                                        >
                                            {c.approved ? 'Approved' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5 text-muted font-mono text-xs whitespace-nowrap">
                                        {new Date(c.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3.5 text-right space-x-3 text-xs sm:text-sm whitespace-nowrap">
                                        <button
                                            onClick={() => handleApprove(c.id, c.approved)}
                                            className={
                                                c.approved
                                                    ? 'text-secondary hover:text-foreground transition-colors'
                                                    : 'text-foreground font-semibold hover:underline underline-offset-4 transition-colors'
                                            }
                                        >
                                            {c.approved ? 'Unapprove' : 'Approve'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(c.id)}
                                            className="text-muted hover:text-red-500 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredComments.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-10 text-center text-muted text-sm"
                                    >
                                        No comments found.
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
