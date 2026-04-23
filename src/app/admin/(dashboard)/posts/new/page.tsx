'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import TiptapEditor from '@/components/admin/TiptapEditor'
import ImageUploader from '@/components/admin/ImageUploader'
import { Category } from '@/lib/types'

export default function NewPostPage() {
    const router = useRouter()
    const [categories, setCategories] = useState<Category[]>([])

    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [excerpt, setExcerpt] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [coverImageUrl, setCoverImageUrl] = useState('')
    const [status, setStatus] = useState<'draft' | 'published'>('draft')
    const [content, setContent] = useState('')
    const [newCategoryName, setNewCategoryName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [publishedAt, setPublishedAt] = useState('')

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data } = await supabase.from('categories').select('*').order('name')
        if (data) {
            setCategories(data as Category[])
        }
    }

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')
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

        const publishedAtISO = publishedAt
            ? new Date(publishedAt).toISOString()
            : (status === 'published' ? new Date().toISOString() : null)

        const { error: insertError } = await supabase.from('posts').insert({
            title,
            slug,
            excerpt,
            content,
            cover_image_url: coverImageUrl || null,
            category_id: categoryId || null,
            status,
            published_at: publishedAtISO,
        })

        if (insertError) {
            setError(insertError.message)
            setLoading(false)
        } else {
            router.push('/admin/posts')
            router.refresh()
        }
    }

    return (
        <div>
            <div className="flex justify-between items-end mb-8 border-b border-[#E5E7EB] pb-4">
                <h1 className="text-xl font-bold text-[#111111]">New Post</h1>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded mb-6 border border-red-200">{error}</div>}

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        className="w-full px-4 py-2 border border-[#E5E7EB] rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-[#111111] transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">Slug</label>
                    <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="w-full px-4 py-2 border border-[#E5E7EB] rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-[#111111] transition-colors"
                    />
                    <p className="text-[#666666] text-[13px] mt-2">Preview: /blog/{slug || '...'}</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">Excerpt</label>
                    <textarea
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-[#E5E7EB] rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-[#111111] transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">Category</label>
                    <div className="flex gap-2 items-center">
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="flex-1 px-4 py-2 border border-[#E5E7EB] rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] bg-white text-[#111111]"
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
                                className="w-40 px-4 py-2 border border-[#E5E7EB] rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-[15px] text-[#111111]"
                            />
                            <button
                                type="button"
                                onClick={handleAddCategory}
                                className="border border-[#E5E7EB] px-4 py-2 rounded text-[15px] text-[#111111] hover:bg-[#F3F4F6] transition-colors"
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
                    <label className="block text-sm font-medium text-[#111111] mb-2">Status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                        className="w-full px-4 py-2 border border-[#E5E7EB] rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] bg-white text-[#111111]"
                    >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">Published Date</label>
                    <input
                        type="datetime-local"
                        value={publishedAt}
                        onChange={(e) => setPublishedAt(e.target.value)}
                        className="w-full px-4 py-2 border border-[#E5E7EB] rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-[#111111]"
                    />
                    <p className="text-[#666666] text-[13px] mt-2">Leave blank to use current time when publishing.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">Content</label>
                    <TiptapEditor content={content} onChange={setContent} />
                </div>

                <div className="pt-6 mt-6 border-t border-[#E5E7EB]">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-[#111111] text-white px-6 py-2.5 rounded hover:bg-[#2563EB] disabled:opacity-50 transition-colors font-medium w-full sm:w-auto"
                    >
                        {loading ? 'Saving...' : 'Save Post'}
                    </button>
                </div>
            </div>
        </div>
    )
}
