'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { Post } from '@/lib/types'

export default function AdminPostsPage() {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)

    const fetchPosts = async () => {
        setLoading(true)
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data } = await supabase
            .from('posts')
            .select('*, category:categories(id, name, slug)')
            .order('created_at', { ascending: false })

        if (data) {
            setPosts(data as unknown as Post[])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchPosts()
    }, [])

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this post?')) return

        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { error } = await supabase.from('posts').delete().eq('id', id)
        if (!error) {
            fetchPosts()
        } else {
            alert('Failed to delete post.')
        }
    }

    return (
        <div>
            <div className="flex justify-between items-end mb-8 border-b border-[#E5E7EB] pb-4">
                <h1 className="text-xl font-bold text-[#111111]">Posts</h1>
                <Link
                    href="/admin/posts/new"
                    className="text-[#111111] hover:text-[#2563EB] text-[15px] font-medium transition-colors"
                >
                    + New Post
                </Link>
            </div>

            {loading ? (
                <div className="py-12 text-[#666666] animate-pulse">Loading posts...</div>
            ) : (
                <div className="bg-white border-y sm:border border-[#E5E7EB] sm:rounded overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F3F4F6] border-b border-[#E5E7EB] text-[13px] uppercase tracking-wider text-[#666666]">
                                <th className="px-4 py-3 font-medium">Title</th>
                                <th className="px-4 py-3 font-medium">Category</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Date</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E7EB]">
                            {posts.map(post => (
                                <tr key={post.id} className="hover:bg-[#F9FAFB] text-[15px] transition-colors">
                                    <td className="px-4 py-3.5 text-[#111111] font-medium">
                                        {post.title}
                                    </td>
                                    <td className="px-4 py-3.5 text-[#666666]">
                                        {post.category?.name || '—'}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span className={post.status === 'published' ? 'text-[#111111]' : 'text-[#666666]'}>
                                            {post.status === 'published' ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5 text-[#666666]">
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3.5 text-right space-x-3">
                                        <Link href={`/admin/posts/${post.id}/edit`} className="text-[#2563EB] hover:text-[#111111] transition-colors">
                                            Edit
                                        </Link>
                                        <button onClick={() => handleDelete(post.id)} className="text-[#666666] hover:text-red-600 transition-colors">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {posts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-[#666666]">
                                        No posts found.
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
