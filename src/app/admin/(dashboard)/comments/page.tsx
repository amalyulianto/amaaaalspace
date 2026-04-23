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
            const formatted = data.map(c => ({
                ...c,
                post_title: c.posts?.title
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
        const { error } = await supabase.from('comments').update({ approved: !currentStatus }).eq('id', id)
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

    const filteredComments = comments.filter(c => {
        if (filter === 'pending') return !c.approved
        if (filter === 'approved') return c.approved
        return true
    })

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-[#111111]">Comments</h1>
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
                    {comments.filter(c => !c.approved).length > 0 && (
                        <span className="bg-orange-100 text-orange-600 text-xs px-1.5 rounded-full">
                            {comments.filter(c => !c.approved).length}
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
                <div className="text-[#666666]">Loading comments...</div>
            ) : (
                <div className="bg-white border border-[#E5E7EB] rounded overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F3F4F6] border-b border-[#E5E7EB] text-sm text-[#666666]">
                                <th className="px-4 py-3 font-medium">Author</th>
                                <th className="px-4 py-3 font-medium">Post</th>
                                <th className="px-4 py-3 font-medium">Comment</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Date</th>
                                <th className="px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredComments.map(c => (
                                <tr key={c.id} className="border-b border-[#E5E7EB] hover:bg-gray-50 text-sm">
                                    <td className="px-4 py-3 text-[#111111] font-medium">{c.author_name}</td>
                                    <td className="px-4 py-3 text-[#666666]">{c.post_title || 'Unknown post'}</td>
                                    <td className="px-4 py-3 text-[#666666] max-w-xs truncate" title={c.content}>
                                        {c.content}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={c.approved ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}>
                                            {c.approved ? 'Approved' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-[#666666]">
                                        {new Date(c.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 space-x-3">
                                        <button
                                            onClick={() => handleApprove(c.id, c.approved)}
                                            className={c.approved ? 'text-gray-500 hover:underline' : 'text-green-600 hover:underline font-medium'}
                                        >
                                            {c.approved ? 'Unapprove' : 'Approve'}
                                        </button>
                                        <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredComments.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-6 text-center text-[#666666]">
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
