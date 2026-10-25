'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import TiptapEditor from '@/components/admin/TiptapEditor'
import ImageUploader from '@/components/admin/ImageUploader'
import { Category, Post } from '@/lib/types'
import { sanitizeHtml, sanitizeUrl } from '@/lib/security'

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
    const [newCategoryDescId, setNewCategoryDescId] = useState('')
    const [newCategoryDescEn, setNewCategoryDescEn] = useState('')
    const [showNewCatForm, setShowNewCatForm] = useState(false)
    const [showEditCatForm, setShowEditCatForm] = useState(false)
    const [editCategoryName, setEditCategoryName] = useState('')
    const [editCategoryDescId, setEditCategoryDescId] = useState('')
    const [editCategoryDescEn, setEditCategoryDescEn] = useState('')
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
        const { data } = await supabase.from('posts').select('*').eq('id', id).single()
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
                const date = new Date(post.published_at)
                const localISO = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 16)
                setPublishedAt(localISO)
            }
        }
        setFetching(false)
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
        const { data, error } = await supabase
            .from('categories')
            .insert({
                name: newCategoryName.trim(),
                slug: newSlug,
                description: newCategoryDescId.trim() || null,
                description_en: newCategoryDescEn.trim() || null,
            })
            .select()
            .single()

        if (error) {
            alert(`Failed to add category: ${error.message}`)
        } else {
            setNewCategoryName('')
            setNewCategoryDescId('')
            setNewCategoryDescEn('')
            setShowNewCatForm(false)
            await fetchCategories()
            if (data?.id) {
                setCategoryId(data.id)
            }
        }
    }

    const openEditSelectedCategory = () => {
        const selectedCat = categories.find((c) => c.id === categoryId)
        if (!selectedCat) return
        setEditCategoryName(selectedCat.name)
        setEditCategoryDescId(selectedCat.description || '')
        setEditCategoryDescEn(selectedCat.description_en || '')
        setShowNewCatForm(false)
        setShowEditCatForm(true)
    }

    const handleUpdateSelectedCategory = async () => {
        if (!categoryId || !editCategoryName.trim()) return
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const newSlug = generateSlug(editCategoryName.trim())
        const { error } = await supabase
            .from('categories')
            .update({
                name: editCategoryName.trim(),
                slug: newSlug,
                description: editCategoryDescId.trim() || null,
                description_en: editCategoryDescEn.trim() || null,
            })
            .eq('id', categoryId)

        if (error) {
            alert(`Failed to update category: ${error.message}`)
        } else {
            setShowEditCatForm(false)
            await fetchCategories()
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

        let finalPublishedAt = publishedAt
            ? new Date(publishedAt).toISOString()
            : initialPublishedAt
        if (status === 'published' && !finalPublishedAt) {
            finalPublishedAt = new Date().toISOString()
        }

        const { error: updateError } = await supabase
            .from('posts')
            .update({
                title: title.trim(),
                slug: slug.trim(),
                excerpt,
                content: sanitizeHtml(content),
                cover_image_url: sanitizeUrl(coverImageUrl),
                category_id: categoryId || null,
                status,
                published_at: finalPublishedAt,
                updated_at: new Date().toISOString(),
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
        return (
            <div className="py-12 text-muted text-sm font-mono animate-pulse">
                Loading post...
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="space-y-3 border-b border-border pb-5">
                <Link
                    href="/admin/posts"
                    className="inline-flex items-center text-xs text-secondary hover:text-foreground transition-colors no-underline"
                >
                    &larr; Back to Posts
                </Link>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Edit Post ✍️
                    </h1>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-foreground text-background px-5 py-2 rounded-lg text-xs sm:text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity self-start sm:self-auto"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-500/20 text-xs sm:text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-secondary">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            className="w-full px-3.5 py-2 border border-border bg-background rounded-lg text-sm text-foreground focus:outline-none focus:border-foreground/50 transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-secondary">Slug</label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="w-full px-3.5 py-2 border border-border bg-background rounded-lg text-sm font-mono text-foreground focus:outline-none focus:border-foreground/50 transition-colors"
                        />
                        <p className="text-muted font-mono text-[11px]">
                            Preview: /blog/{slug || '...'}
                        </p>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-secondary">Excerpt</label>
                    <textarea
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        rows={2}
                        className="w-full px-3.5 py-2 border border-border bg-background rounded-lg text-sm text-foreground focus:outline-none focus:border-foreground/50 transition-colors leading-relaxed"
                    />
                </div>

                <div className="p-5 rounded-xl border border-border bg-surface/30 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-secondary">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                                className="w-full px-3.5 py-2 border border-border rounded-lg bg-background text-sm text-foreground focus:outline-none focus:border-foreground/50 transition-colors"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-secondary">Published Date</label>
                            <input
                                type="datetime-local"
                                value={publishedAt}
                                onChange={(e) => setPublishedAt(e.target.value)}
                                className="w-full px-3.5 py-2 border border-border rounded-lg bg-background text-sm text-foreground focus:outline-none focus:border-foreground/50 transition-colors"
                            />
                            <p className="text-muted text-[11px]">
                                Manual publication date/time.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-border/60">
                        <div className="flex items-center justify-between">
                            <label className="block text-xs font-medium text-secondary">Category</label>
                            <div className="flex items-center gap-3">
                                {categoryId && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (showEditCatForm) {
                                                setShowEditCatForm(false)
                                            } else {
                                                openEditSelectedCategory()
                                            }
                                        }}
                                        className="text-xs font-medium text-secondary hover:text-foreground underline underline-offset-4 transition-colors"
                                    >
                                        {showEditCatForm ? 'Cancel Edit' : 'Edit Selected Category'}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditCatForm(false)
                                        setShowNewCatForm(!showNewCatForm)
                                    }}
                                    className="text-xs font-medium text-foreground underline underline-offset-4 hover:opacity-80"
                                >
                                    {showNewCatForm ? 'Cancel' : '+ New Category'}
                                </button>
                            </div>
                        </div>

                        <select
                            value={categoryId}
                            onChange={(e) => {
                                setCategoryId(e.target.value)
                                setShowEditCatForm(false)
                            }}
                            className="w-full px-3.5 py-2 border border-border rounded-lg bg-background text-sm text-foreground focus:outline-none focus:border-foreground/50 transition-colors"
                        >
                            <option value="">No Category</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>

                        {showEditCatForm && categoryId && (
                            <div className="p-4 rounded-xl border border-border bg-background space-y-3 animate-in slide-in-from-top-2 duration-200">
                                <div className="text-xs font-mono uppercase tracking-wider text-muted">
                                    Edit Selected Category & Descriptions
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Category Name"
                                        value={editCategoryName}
                                        onChange={(e) => setEditCategoryName(e.target.value)}
                                        className="px-3 py-2 border border-border bg-surface/40 rounded-lg text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/50"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Description (ID)"
                                        value={editCategoryDescId}
                                        onChange={(e) => setEditCategoryDescId(e.target.value)}
                                        className="px-3 py-2 border border-border bg-surface/40 rounded-lg text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/50"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Description (EN)"
                                        value={editCategoryDescEn}
                                        onChange={(e) => setEditCategoryDescEn(e.target.value)}
                                        className="px-3 py-2 border border-border bg-surface/40 rounded-lg text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/50"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={handleUpdateSelectedCategory}
                                        className="bg-foreground text-background px-4 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
                                    >
                                        Save Category Changes
                                    </button>
                                </div>
                            </div>
                        )}

                        {showNewCatForm && (
                            <div className="p-4 rounded-xl border border-border bg-background space-y-3 animate-in slide-in-from-top-2 duration-200">
                                <div className="text-xs font-mono uppercase tracking-wider text-muted">
                                    Create New Category
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Category Name"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        className="px-3 py-2 border border-border bg-surface/40 rounded-lg text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/50"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Description (ID)"
                                        value={newCategoryDescId}
                                        onChange={(e) => setNewCategoryDescId(e.target.value)}
                                        className="px-3 py-2 border border-border bg-surface/40 rounded-lg text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/50"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Description (EN)"
                                        value={newCategoryDescEn}
                                        onChange={(e) => setNewCategoryDescEn(e.target.value)}
                                        className="px-3 py-2 border border-border bg-surface/40 rounded-lg text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/50"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={handleAddCategory}
                                        className="bg-foreground text-background px-4 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
                                    >
                                        Create Category
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-2 border-t border-border/60">
                        <ImageUploader onUpload={setCoverImageUrl} currentUrl={coverImageUrl} />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-xs font-medium text-secondary">Content</label>
                    <TiptapEditor content={content} onChange={setContent} />
                </div>

                <div className="pt-6 border-t border-border flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-foreground text-background px-6 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity text-xs sm:text-sm font-medium w-full sm:w-auto"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    )
}
