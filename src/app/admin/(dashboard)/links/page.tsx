'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { LinkItem } from '@/lib/types'
import { ArrowUp, ArrowDown, Trash2, Edit2, Plus } from 'lucide-react'
import { sanitizeUrl } from '@/lib/security'

const ICON_OPTIONS = [
    'Link2', 'Mail', 'Globe', 'Book', 'Briefcase', 'FileText', 'Code',
    'MessageSquare', 'Coffee', 'Video', 'Music', 'Monitor', 'Smartphone', 'Heart', 'Star', 'Cloud'
]

export default function AdminLinksPage() {
    const [links, setLinks] = useState<LinkItem[]>([])
    const [loading, setLoading] = useState(true)
    const [formLoading, setFormLoading] = useState(false)
    const [error, setError] = useState('')

    // Form state
    const [editingId, setEditingId] = useState<string | null>(null)
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [icon, setIcon] = useState('Link2')

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        fetchLinks()
    }, [])

    const fetchLinks = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('links')
            .select('*')
            .order('display_order', { ascending: true })

        if (error) {
            setError(error.message)
        } else {
            setLinks(data as LinkItem[])
        }
        setLoading(false)
    }

    const resetForm = () => {
        setEditingId(null)
        setTitle('')
        setUrl('')
        setIcon('Link2')
    }

    const handleEdit = (link: LinkItem) => {
        setEditingId(link.id)
        setTitle(link.title)
        setUrl(link.url)
        setIcon(link.icon || 'Link2')
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        const safeUrl = sanitizeUrl(url, true)
        if (!safeUrl) {
            setError('Please enter a valid http://, https://, or mailto: URL.')
            return
        }

        setFormLoading(true)

        if (editingId) {
            const { error: updateError } = await supabase
                .from('links')
                .update({ title: title.trim(), url: safeUrl, icon })
                .eq('id', editingId)

            if (updateError) setError(updateError.message)
            else {
                resetForm()
                fetchLinks()
            }
        } else {
            const display_order = links.length > 0 ? links[links.length - 1].display_order + 1 : 0
            const { error: insertError } = await supabase
                .from('links')
                .insert({ title: title.trim(), url: safeUrl, icon, display_order })

            if (insertError) setError(insertError.message)
            else {
                resetForm()
                fetchLinks()
            }
        }
        setFormLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this link?')) return
        const { error } = await supabase.from('links').delete().eq('id', id)
        if (error) {
            alert(error.message)
        } else {
            fetchLinks()
        }
    }

    const handleMove = async (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return
        if (direction === 'down' && index === links.length - 1) return

        const newLinks = [...links]
        const swapIndex = direction === 'up' ? index - 1 : index + 1

        const temp = newLinks[index]
        newLinks[index] = newLinks[swapIndex]
        newLinks[swapIndex] = temp

        const updates = newLinks.map((link, i) => ({
            ...link,
            display_order: i
        }))

        setLinks(updates)

        for (const update of updates) {
            await supabase.from('links').update({ display_order: update.display_order }).eq('id', update.id)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="border-b border-border pb-5 space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Important Links 🔗
                </h1>
                <p className="text-xs sm:text-sm text-secondary">
                    Add, reorder, or edit external links displayed on your public /links page.
                </p>
            </div>

            {error && (
                <div className="bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-500/20 text-xs sm:text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Column */}
                <div className="lg:col-span-1">
                    <div className="bg-surface/40 p-5 rounded-xl border border-border sticky top-6 space-y-4">
                        <h2 className="text-sm font-bold text-foreground">
                            {editingId ? 'Edit Link' : 'Add New Link'}
                        </h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-medium text-secondary">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="GitHub"
                                    className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-medium text-secondary">
                                    URL
                                </label>
                                <input
                                    type="url"
                                    required
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://"
                                    className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-medium text-secondary">
                                    Icon
                                </label>
                                <select
                                    value={icon}
                                    onChange={(e) => setIcon(e.target.value)}
                                    className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-foreground/50 transition-colors"
                                >
                                    {ICON_OPTIONS.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-2 flex gap-2">
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="flex-1 bg-foreground text-background px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-1.5"
                                >
                                    {formLoading ? (
                                        'Saving...'
                                    ) : editingId ? (
                                        <>
                                            <Edit2 className="w-3.5 h-3.5" /> Save
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-3.5 h-3.5" /> Add Link
                                        </>
                                    )}
                                </button>
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-3.5 py-2 bg-surface text-secondary hover:text-foreground border border-border rounded-lg text-xs sm:text-sm font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* List Column */}
                <div className="lg:col-span-2">
                    <div className="bg-surface/20 rounded-xl border border-border overflow-hidden">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-surface/70 border-b border-border text-xs font-mono uppercase tracking-wider text-muted">
                                    <th className="py-3 px-4 font-medium w-20">Icon</th>
                                    <th className="py-3 px-4 font-medium">Link Details</th>
                                    <th className="py-3 px-4 font-medium w-24 text-center">Order</th>
                                    <th className="py-3 px-4 font-medium text-right w-24">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="py-10 text-center text-muted font-mono text-sm animate-pulse">
                                            Loading links...
                                        </td>
                                    </tr>
                                ) : links.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-10 text-center text-muted text-sm">
                                            No links found. Create one.
                                        </td>
                                    </tr>
                                ) : (
                                    links.map((link, index) => {
                                        const safeLinkUrl = sanitizeUrl(link.url, true)
                                        return (
                                            <tr key={link.id} className="hover:bg-surface/50 transition-colors">
                                                <td className="py-3.5 px-4">
                                                    <span className="inline-block px-2 py-1 bg-surface border border-border rounded-md text-secondary font-mono text-[11px]">
                                                        {link.icon || 'Link2'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="font-medium text-foreground">{link.title}</div>
                                                    {safeLinkUrl ? (
                                                        <a
                                                            href={safeLinkUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-muted hover:text-foreground truncate max-w-[240px] inline-block hover:underline underline-offset-4"
                                                        >
                                                            {safeLinkUrl}
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-red-500">Invalid URL</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            onClick={() => handleMove(index, 'up')}
                                                            disabled={index === 0}
                                                            className="p-1.5 rounded-md text-secondary hover:text-foreground hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            <ArrowUp className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleMove(index, 'down')}
                                                            disabled={index === links.length - 1}
                                                            className="p-1.5 rounded-md text-secondary hover:text-foreground hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            <ArrowDown className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => handleEdit(link)}
                                                            className="text-secondary hover:text-foreground p-1.5 rounded-md hover:bg-surface transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(link.id)}
                                                            className="text-muted hover:text-red-500 p-1.5 rounded-md hover:bg-surface transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
