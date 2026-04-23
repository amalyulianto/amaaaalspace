'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import TiptapEditor from '@/components/admin/TiptapEditor'
import ImageUploader from '@/components/admin/ImageUploader'
import { Category, Post } from '@/lib/types'

export default function EditPostPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const { id } = params

    const [categories, setCategories] = useState<Category[]>([])

    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [excerpt, setExcerpt] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [coverImageUrl, setCoverImageUrl] = useState('')
    const [status, setStatus] = useState<'draft' | 'published'>('draft')
    const [content, setContent] = useState('')
    const [initialPublishedAt, setInitialPublishedAt] = useState<string | null>(null)
    const [publishedAt, setPublishedAt] = useState('')

    const [newCategoryName, setNewCategoryName] = useState('')
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchCategories()
        fetchPost()
    }, [])

    const fetchCategories = async () => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data } = await supabase.from('categories').select('*').order('name')
        if (data) setCategories(data as Category[])
    }

    const fetchPost = async () => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data, error } = await supabase.from('posts').select('*').eq('id', id).single()
        if (data) {
            const post = data as Post
            setTitle(post.title)
            setSlug(post.slug)
            setExcerpt(post.excerpt || '')
            setCategoryId(post.category_id || '')
            setCoverImageUrl(post.cover_image_url || '')
            setStatus(post.status)
            setContent(post.content || '')
            setInitialPublishedAt(post.published_at)
            if (post.published_at) {
                // Convert UTC to local datetime-local format (YYYY-MM-DDTHH:mm)
                const date = new Date(post.published_at)
                const localISO = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                setPublishedAt(localISO)
            }
        }
        setFetching(false)
    }

    const generateSlug = (text: string) => {
        return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value
        setTitle(newTitle)
        setSlug(generateSlug(newTitle))
    }

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const newSlug = generateSlug(newCategoryName)
        const { error } = await supabase.from('categories').insert({ name: newCategoryName, slug: newSlug })
        if (error) {
            alert('Failed to add category')
        } else {
            setNewCategoryName('')
            fetchCategories()
        }
    }

    const handleSave = async () => {
        if (!title || !slug) {
            setError('Title and slug are required.')
            return
        }

        setLoading(true)
        setError('')

        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        let finalPublishedAt = publishedAt ? new Date(publishedAt).toISOString() : initialPublishedAt
        if (status === 'published' && !finalPublishedAt) {
            finalPublishedAt = new Date().toISOString()
        }

        const { error: updateError } = await supabase
            .from('posts')
            .update({
                title,
                slug,
                excerpt,
                content,
                cover_image_url: coverImageUrl || null,
                category_id: categoryId || null,
                status,
                published_at: finalPublishedAt,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)

        if (updateError) {
            setError(updateError.message)
            setLoading(false)
        } else {
            router.push('/admin/posts')
            router.refresh()
        }
    }

    if (fetching) {
        return <div className="text-[#666666]">Loading post...</div>
    }

    return (
        <div className="max-w-4xl">
            <h1 className="text-2xl font-bold text-[#111111] mb-8">Edit Post</h1>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded mb-6 border border-red-200">{error}</div>}

            <div className="space-y-6 bg-white p-6 rounded border border-[#E5E7EB]">
                <div>
                    <label className="block text-sm font-medium text-[#666666] mb-1">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#666666] mb-1">Slug</label>
                    <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                    />
                    <p className="text-xs text-gray-500 mt-1">Preview: /blog/{slug || '...'}</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#666666] mb-1">Excerpt</label>
                    <textarea
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#666666] mb-1">Category</label>
                    <div className="flex gap-2 items-center">
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                        >
                            <option value="">No Category</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <div className="flex items-center gap-2 border-l border-[#E5E7EB] pl-4">
                            <input
                                type="text"
                                placeholder="New Category"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="w-40 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                            />
                            <button
                                type="button"
                                onClick={handleAddCategory}
                                className="bg-white border border-[#E5E7EB] px-3 py-2 rounded text-sm hover:bg-gray-50"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    <ImageUploader onUpload={setCoverImageUrl} currentUrl={coverImageUrl} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#666666] mb-1">Status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                    >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#666666] mb-1">Published Date</label>
                    <input
                        type="datetime-local"
                        value={publishedAt}
                        onChange={(e) => setPublishedAt(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                    />
                    <p className="text-xs text-gray-500 mt-1">Manual publication date/time.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#666666] mb-1">Content</label>
                    <TiptapEditor content={content} onChange={setContent} />
                </div>

                <div className="pt-4 border-t border-[#E5E7EB]">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-[#2563EB] text-white px-6 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    )
}
