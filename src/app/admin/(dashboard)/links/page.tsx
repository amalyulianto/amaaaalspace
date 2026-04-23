'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { LinkItem } from '@/lib/types'
import { ArrowUp, ArrowDown, Trash2, Edit2, Plus } from 'lucide-react'

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
        setFormLoading(true)
        setError('')

        if (editingId) {
            // Update
            const { error: updateError } = await supabase
                .from('links')
                .update({ title, url, icon })
                .eq('id', editingId)

            if (updateError) setError(updateError.message)
            else {
                resetForm()
                fetchLinks()
            }
        } else {
            // Insert
            const display_order = links.length > 0 ? links[links.length - 1].display_order + 1 : 0
            const { error: insertError } = await supabase
                .from('links')
                .insert({ title, url, icon, display_order })

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

        // Swap array items
        const temp = newLinks[index]
        newLinks[index] = newLinks[swapIndex]
        newLinks[swapIndex] = temp

        // Overwrite display_orders optimally 1 by 1 based on array order
        const updates = newLinks.map((link, i) => ({
            ...link,
            display_order: i
        }))

        // Optimistically update UI
        setLinks(updates)

        // Sync to DB
        // Workaround since upsert causes full object overwrites.
        for (const update of updates) {
            await supabase.from('links').update({ display_order: update.display_order }).eq('id', update.id)
        }
    }

    return (
        <div className="max-w-4xl">
            <h1 className="text-2xl font-bold text-[#111111] mb-8">Manage Links</h1>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded mb-6 border border-red-200">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Form Column */}
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded border border-[#E5E7EB] sticky top-6">
                        <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Link' : 'Add New Link'}</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#666666] mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="GitHub"
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#666666] mb-1">URL</label>
                                <input
                                    type="url"
                                    required
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://"
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#666666] mb-1">Icon</label>
                                <select
                                    value={icon}
                                    onChange={(e) => setIcon(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                                >
                                    {ICON_OPTIONS.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-4 flex gap-2">
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="flex-1 bg-[#2563EB] text-white px-4 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
                                >
                                    {formLoading ? 'Saving...' : editingId ? <><Edit2 className="w-4 h-4" /> Save</> : <><Plus className="w-4 h-4" /> Add</>}
                                </button>
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded font-medium hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* List Column */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded border border-[#E5E7EB] overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-[#E5E7EB] text-sm text-[#666666]">
                                    <th className="py-3 px-4 font-medium w-16">Icon</th>
                                    <th className="py-3 px-4 font-medium">Link Details</th>
                                    <th className="py-3 px-4 font-medium w-24 text-center">Order</th>
                                    <th className="py-3 px-4 font-medium text-right w-24">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-[#666666]">Loading links...</td>
                                    </tr>
                                ) : links.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-[#666666]">No links found. Create one.</td>
                                    </tr>
                                ) : (
                                    links.map((link, index) => (
                                        <tr key={link.id} className="border-b border-[#E5E7EB] last:border-0 hover:bg-gray-50">
                                            <td className="py-3 px-4 text-center">
                                                <span className="inline-block p-2 bg-neutral-100 rounded text-neutral-600 text-xs">
                                                    {link.icon || 'Link2'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-medium text-[#111111]">{link.title}</div>
                                                <a href={link.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 truncate max-w-[200px] inline-block hover:underline">
                                                    {link.url}
                                                </a>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => handleMove(index, 'up')}
                                                        disabled={index === 0}
                                                        className="p-1 text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                                                    >
                                                        <ArrowUp className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleMove(index, 'down')}
                                                        disabled={index === links.length - 1}
                                                        className="p-1 text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                                                    >
                                                        <ArrowDown className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(link)}
                                                        className="text-blue-600 hover:text-blue-800 p-1"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(link.id)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
