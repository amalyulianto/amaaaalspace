'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { Category, Post } from '@/lib/types'

export default function AdminPostsPage() {
    const [posts, setPosts] = useState<Post[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [showCategoriesPanel, setShowCategoriesPanel] = useState(false)

    // New Category Form
    const [newName, setNewName] = useState('')
    const [newDescId, setNewDescId] = useState('')
    const [newDescEn, setNewDescEn] = useState('')
    const [savingCategory, setSavingCategory] = useState(false)

    // Editing Category State
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [editDescId, setEditDescId] = useState('')
    const [editDescEn, setEditDescEn] = useState('')

    const generateSlug = (text: string) =>
        text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')

    const fetchAll = async () => {
        setLoading(true)
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const [postsRes, catsRes] = await Promise.all([
            supabase
                .from('posts')
                .select('*, category:categories(id, name, slug)')
                .order('published_at', { ascending: false, nullsFirst: false }),
            supabase.from('categories').select('*').order('name', { ascending: true }),
        ])

        if (postsRes.data) {
            setPosts(postsRes.data as unknown as Post[])
        }
        if (catsRes.data) {
            setCategories(catsRes.data as Category[])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchAll()
    }, [])

    const handleDeletePost = async (id: string) => {
        if (!window.confirm('Delete this post?')) return

        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { error } = await supabase.from('posts').delete().eq('id', id)
        if (!error) {
            fetchAll()
        } else {
            alert('Failed to delete post.')
        }
    }

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newName.trim()) return

        setSavingCategory(true)
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const slug = generateSlug(newName.trim())
        const { error } = await supabase.from('categories').insert({
            name: newName.trim(),
            slug,
            description: newDescId.trim() || null,
            description_en: newDescEn.trim() || null,
        })

        setSavingCategory(false)

        if (error) {
            alert(
                `Failed to save category: ${error.message}\n\nMake sure you ran:\nALTER TABLE categories ADD COLUMN IF NOT EXISTS description text, ADD COLUMN IF NOT EXISTS description_en text;`
            )
        } else {
            setNewName('')
            setNewDescId('')
            setNewDescEn('')
            fetchAll()
        }
    }

    const startEditingCategory = (cat: Category) => {
        setEditingCategoryId(cat.id)
        setEditName(cat.name)
        setEditDescId(cat.description || '')
        setEditDescEn(cat.description_en || '')
    }

    const handleUpdateCategory = async (id: string) => {
        if (!editName.trim()) return

        setSavingCategory(true)
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const slug = generateSlug(editName.trim())
        const { error } = await supabase
            .from('categories')
            .update({
                name: editName.trim(),
                slug,
                description: editDescId.trim() || null,
                description_en: editDescEn.trim() || null,
            })
            .eq('id', id)

        setSavingCategory(false)

        if (error) {
            alert(
                `Failed to update category: ${error.message}\n\nMake sure you ran:\nALTER TABLE categories ADD COLUMN IF NOT EXISTS description text, ADD COLUMN IF NOT EXISTS description_en text;`
            )
        } else {
            setEditingCategoryId(null)
            fetchAll()
        }
    }

    const handleDeleteCategory = async (id: string) => {
        if (!window.confirm('Delete this category? Posts using it will become uncategorized.')) {
            return
        }

        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { error } = await supabase.from('categories').delete().eq('id', id)
        if (!error) {
            fetchAll()
        } else {
            alert('Failed to delete category.')
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 border-b border-border pb-5">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Posts ✍️
                    </h1>
                    <p className="text-xs sm:text-sm text-secondary">
                        Manage your published writings, drafts, and category descriptions.
                    </p>
                </div>
                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                    <button
                        type="button"
                        onClick={() => setShowCategoriesPanel(!showCategoriesPanel)}
                        className="inline-flex items-center justify-center bg-surface border border-border text-foreground hover:border-foreground/30 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                    >
                        {showCategoriesPanel ? 'Hide Categories' : `Categories (${categories.length})`}
                    </button>
                    <Link
                        href="/admin/posts/new"
                        className="inline-flex items-center justify-center bg-foreground text-background hover:opacity-90 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-opacity no-underline"
                    >
                        + New Post
                    </Link>
                </div>
            </div>

            {/* Category & Dual-Language Description Manager */}
            {showCategoriesPanel && (
                <section className="p-5 rounded-xl border border-border bg-surface/30 space-y-6 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-1">
                        <h2 className="text-base font-bold text-foreground m-0">
                            Writings Categories & Descriptions (ID / EN)
                        </h2>
                        <p className="text-xs text-secondary m-0">
                            Descriptions appear beneath the &ldquo;Tulisan ✍️&rdquo; heading when visitors filter by category.
                        </p>
                    </div>

                    {/* Add New Category Form */}
                    <form
                        onSubmit={handleCreateCategory}
                        className="p-4 rounded-xl border border-border bg-background space-y-3"
                    >
                        <div className="text-xs font-mono uppercase tracking-wider text-muted">
                            Add New Category
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Category Name (e.g. Cerita Pendek)"
                                required
                                className="px-3.5 py-2 border border-border bg-surface/40 rounded-lg text-xs sm:text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors"
                            />
                            <input
                                type="text"
                                value={newDescId}
                                onChange={(e) => setNewDescId(e.target.value)}
                                placeholder="Description (ID) - Bahasa Indonesia..."
                                className="px-3.5 py-2 border border-border bg-surface/40 rounded-lg text-xs sm:text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors"
                            />
                            <input
                                type="text"
                                value={newDescEn}
                                onChange={(e) => setNewDescEn(e.target.value)}
                                placeholder="Description (EN) - English..."
                                className="px-3.5 py-2 border border-border bg-surface/40 rounded-lg text-xs sm:text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={savingCategory}
                                className="inline-flex items-center justify-center bg-foreground text-background hover:opacity-90 px-4 py-2 rounded-lg text-xs font-medium transition-opacity disabled:opacity-50"
                            >
                                {savingCategory ? 'Saving...' : '+ Add Category'}
                            </button>
                        </div>
                    </form>

                    {/* Existing Categories List */}
                    <div className="space-y-2.5">
                        {categories.map((cat) => {
                            const isEditing = editingCategoryId === cat.id
                            return (
                                <div
                                    key={cat.id}
                                    className="p-4 rounded-xl border border-border bg-background space-y-3"
                                >
                                    {isEditing ? (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div className="space-y-1">
                                                    <label className="block text-[11px] font-mono text-muted">
                                                        Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="w-full px-3 py-2 border border-border bg-surface/40 rounded-lg text-xs sm:text-sm text-foreground focus:outline-none focus:border-foreground/50"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="block text-[11px] font-mono text-muted">
                                                        Description (ID)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={editDescId}
                                                        onChange={(e) => setEditDescId(e.target.value)}
                                                        placeholder="Indonesian description..."
                                                        className="w-full px-3 py-2 border border-border bg-surface/40 rounded-lg text-xs sm:text-sm text-foreground focus:outline-none focus:border-foreground/50"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="block text-[11px] font-mono text-muted">
                                                        Description (EN)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={editDescEn}
                                                        onChange={(e) => setEditDescEn(e.target.value)}
                                                        placeholder="English description..."
                                                        className="w-full px-3 py-2 border border-border bg-surface/40 rounded-lg text-xs sm:text-sm text-foreground focus:outline-none focus:border-foreground/50"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingCategoryId(null)}
                                                    className="px-3.5 py-1.5 rounded-lg border border-border bg-background text-xs font-medium text-secondary hover:text-foreground transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={savingCategory}
                                                    onClick={() => handleUpdateCategory(cat.id)}
                                                    className="bg-foreground text-background hover:opacity-90 px-4 py-1.5 rounded-lg text-xs font-medium transition-opacity disabled:opacity-50"
                                                >
                                                    Save Changes
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div className="space-y-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-foreground">
                                                        {cat.name}
                                                    </span>
                                                    <span className="text-xs font-mono text-muted">
                                                        /blog/category/{cat.slug}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-secondary space-y-0.5">
                                                    <div>
                                                        <span className="font-mono text-[10px] uppercase text-muted mr-1.5">
                                                            ID:
                                                        </span>
                                                        {cat.description || (
                                                            <span className="italic text-muted">
                                                                No ID description (uses default)
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="font-mono text-[10px] uppercase text-muted mr-1.5">
                                                            EN:
                                                        </span>
                                                        {cat.description_en || (
                                                            <span className="italic text-muted">
                                                                No EN description (uses default)
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 text-xs shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => startEditingCategory(cat)}
                                                    className="text-foreground hover:underline underline-offset-4 font-medium"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteCategory(cat.id)}
                                                    className="text-muted hover:text-red-500 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                        {categories.length === 0 && (
                            <p className="text-xs text-muted py-2">No categories created yet.</p>
                        )}
                    </div>
                </section>
            )}

            {loading ? (
                <div className="py-12 text-muted text-sm font-mono animate-pulse">
                    Loading posts...
                </div>
            ) : (
                <div className="bg-surface/20 border border-border rounded-xl overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-surface/70 border-b border-border text-xs font-mono uppercase tracking-wider text-muted">
                                <th className="px-4 py-3 font-medium">Title</th>
                                <th className="px-4 py-3 font-medium">Category</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Created</th>
                                <th className="px-4 py-3 font-medium">Published</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {posts.map((post) => (
                                <tr
                                    key={post.id}
                                    className="hover:bg-surface/50 transition-colors"
                                >
                                    <td className="px-4 py-3.5 text-foreground font-medium">
                                        {post.title}
                                    </td>
                                    <td className="px-4 py-3.5 text-secondary text-xs sm:text-sm">
                                        {post.category?.name ? (
                                            <span className="inline-block px-2 py-0.5 rounded-md bg-surface text-secondary border border-border text-xs">
                                                {post.category.name}
                                            </span>
                                        ) : (
                                            <span className="text-muted">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${
                                                post.status === 'published'
                                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                                                    : 'bg-surface text-secondary border-border'
                                            }`}
                                        >
                                            {post.status === 'published' ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5 text-muted font-mono text-xs">
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3.5 text-muted font-mono text-xs">
                                        {post.published_at
                                            ? new Date(post.published_at).toLocaleDateString()
                                            : '—'}
                                    </td>
                                    <td className="px-4 py-3.5 text-right space-x-3 text-xs sm:text-sm whitespace-nowrap">
                                        <Link
                                            href={`/admin/posts/${post.id}/edit`}
                                            className="text-foreground hover:underline underline-offset-4 font-medium transition-colors"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDeletePost(post.id)}
                                            className="text-muted hover:text-red-500 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {posts.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-10 text-center text-muted text-sm"
                                    >
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
