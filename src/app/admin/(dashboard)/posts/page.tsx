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
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-[#111111]">Posts</h1>
                <Link
                    href="/admin/posts/new"
                    className="bg-[#2563EB] text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    New Post
                </Link>
            </div>

            {loading ? (
                <div className="text-[#666666]">Loading posts...</div>
            ) : (
                <div className="bg-white border border-[#E5E7EB] rounded overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F3F4F6] border-b border-[#E5E7EB] text-sm text-[#666666]">
                                <th className="px-4 py-3 font-medium">Title</th>
                                <th className="px-4 py-3 font-medium">Category</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Date</th>
                                <th className="px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map(post => (
                                <tr key={post.id} className="border-b border-[#E5E7EB] hover:bg-gray-50 text-sm">
                                    <td className="px-4 py-3 text-[#111111] font-medium">{post.title}</td>
                                    <td className="px-4 py-3 text-[#666666]">{post.category?.name || 'Uncategorized'}</td>
                                    <td className="px-4 py-3">
                                        <span className={post.status === 'published' ? 'text-green-600 font-medium' : 'text-gray-500 font-medium'}>
                                            {post.status === 'published' ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-[#666666]">
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 space-x-3">
                                        <Link href={`/admin/posts/${post.id}/edit`} className="text-[#2563EB] hover:underline">
                                            Edit
                                        </Link>
                                        <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:underline">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {posts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-6 text-center text-[#666666]">
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
