'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { ShortLink } from '@/lib/types'
import { Copy, Check, Trash2, Plus, ExternalLink, RefreshCw } from 'lucide-react'

const RESERVED_SLUGS = [
    'blog',
    'portfolio',
    'resume',
    'guestbook',
    'links',
    'me',
    'admin',
    'api',
    'robots.txt',
    'sitemap.xml',
    'favicon.ico',
]

function generateRandomSlug(length = 6): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

export default function AdminShortLinksPage() {
    const [links, setLinks] = useState<ShortLink[]>([])
    const [loading, setLoading] = useState(true)
    const [formLoading, setFormLoading] = useState(false)
    const [error, setError] = useState('')
    const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

    // Form states
    const [destinationUrl, setDestinationUrl] = useState('')
    const [slug, setSlug] = useState('')

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const siteDomain = typeof window !== 'undefined'
        ? window.location.host
        : 'alapakadala.lol'

    const fetchLinks = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('short_links')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            setError(error.message)
        } else {
            setLinks((data as ShortLink[]) || [])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchLinks()
    }, [])

    const handleGenerateSlug = () => {
        setSlug(generateRandomSlug())
    }

    const handleCreateLink = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        let trimmedSlug = slug.trim().toLowerCase()
        const trimmedUrl = destinationUrl.trim()

        if (!trimmedUrl) {
            setError('Please enter a destination URL.')
            return
        }

        // Validate destination URL format
        try {
            new URL(trimmedUrl)
        } catch {
            setError('Please enter a valid URL including http:// or https://')
            return
        }

        // Auto-generate if empty
        if (!trimmedSlug) {
            trimmedSlug = generateRandomSlug()
        }

        // Check against reserved slugs
        if (RESERVED_SLUGS.includes(trimmedSlug)) {
            setError(`"${trimmedSlug}" is a reserved system path and cannot be used as a short link.`)
            return
        }

        // Validate slug characters
        if (!/^[a-zA-Z0-9-_]+$/.test(trimmedSlug)) {
            setError('Slug can only contain letters, numbers, hyphens (-), and underscores (_).')
            return
        }

        setFormLoading(true)

        const { error: insertError } = await supabase
            .from('short_links')
            .insert({
                slug: trimmedSlug,
                destination_url: trimmedUrl,
            })

        if (insertError) {
            if (insertError.code === '23505') {
                setError(`The slug "${trimmedSlug}" is already taken. Please choose another one.`)
            } else {
                setError(insertError.message)
            }
        } else {
            setDestinationUrl('')
            setSlug('')
            fetchLinks()
        }

        setFormLoading(false)
    }

    const handleDelete = async (id: string, slugName: string) => {
        if (!window.confirm(`Delete short link "/${slugName}"?`)) return

        const { error: deleteError } = await supabase
            .from('short_links')
            .delete()
            .eq('id', id)

        if (deleteError) {
            alert(deleteError.message)
        } else {
            fetchLinks()
        }
    }

    const handleCopy = (shortSlug: string) => {
        const fullUrl = `${window.location.protocol}//${siteDomain}/${shortSlug}`
        navigator.clipboard.writeText(fullUrl)
        setCopiedSlug(shortSlug)
        setTimeout(() => setCopiedSlug(null), 2000)
    }

    return (
        <div className="max-w-4xl">
            <div className="flex justify-between items-center mb-8 border-b border-[#E5E7EB] dark:border-neutral-800 pb-4">
                <div>
                    <h1 className="text-xl font-bold text-[#111111] dark:text-white">Short Links</h1>
                    <p className="text-sm text-[#666666] dark:text-neutral-400 mt-1">
                        Create custom or random short URLs that redirect to external destinations.
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded mb-6 border border-red-200 dark:border-red-900/40 text-sm">
                    {error}
                </div>
            )}

            {/* Create Form */}
            <div className="bg-white dark:bg-[#161616] p-6 rounded border border-[#E5E7EB] dark:border-neutral-800 mb-8">
                <h2 className="text-base font-bold text-[#111111] dark:text-white mb-4">Create New Short Link</h2>
                <form onSubmit={handleCreateLink} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[#666666] dark:text-neutral-400 mb-1">
                                Destination URL <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="url"
                                required
                                value={destinationUrl}
                                onChange={(e) => setDestinationUrl(e.target.value)}
                                placeholder="https://example.com/very/long/url"
                                className="w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-neutral-700 rounded text-sm text-[#111111] dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-[#666666] dark:text-neutral-400">
                                    Custom Slug (optional)
                                </label>
                                <button
                                    type="button"
                                    onClick={handleGenerateSlug}
                                    className="text-xs text-[#2563EB] hover:underline flex items-center gap-1 font-medium"
                                >
                                    <RefreshCw className="w-3 h-3" /> Random
                                </button>
                            </div>
                            <div className="flex items-center">
                                <span className="inline-flex items-center px-3 py-2 rounded-l border border-r-0 border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-xs text-[#666666] dark:text-neutral-400 select-none">
                                    /{''}
                                </span>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder="e.g. 3dmath (or leave empty for random)"
                                    className="w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-neutral-700 rounded-r text-sm text-[#111111] dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={formLoading}
                            className="bg-[#2563EB] text-white px-5 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" />
                            {formLoading ? 'Creating...' : 'Create Short Link'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Links Table */}
            {loading ? (
                <div className="py-12 text-[#666666] dark:text-neutral-400 text-sm animate-pulse">
                    Loading short links...
                </div>
            ) : (
                <div className="bg-white dark:bg-[#161616] border border-[#E5E7EB] dark:border-neutral-800 rounded overflow-hidden">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-[#F3F4F6] dark:bg-neutral-800/60 border-b border-[#E5E7EB] dark:border-neutral-800 text-xs uppercase tracking-wider text-[#666666] dark:text-neutral-400">
                                <th className="px-4 py-3 font-medium">Short URL</th>
                                <th className="px-4 py-3 font-medium">Destination</th>
                                <th className="px-4 py-3 font-medium text-center w-24">Clicks</th>
                                <th className="px-4 py-3 font-medium w-28">Created</th>
                                <th className="px-4 py-3 font-medium text-right w-20">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E7EB] dark:divide-neutral-800">
                            {links.map((item) => (
                                <tr key={item.id} className="hover:bg-[#F9FAFB] dark:hover:bg-neutral-800/30 transition-colors">
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-[#111111] dark:text-white">
                                                /{item.slug}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(item.slug)}
                                                title="Copy short link"
                                                className="text-[#666666] dark:text-neutral-400 hover:text-[#2563EB] p-1 rounded transition-colors"
                                            >
                                                {copiedSlug === item.slug ? (
                                                    <Check className="w-3.5 h-3.5 text-green-600" />
                                                ) : (
                                                    <Copy className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 max-w-xs">
                                        <a
                                            href={item.destination_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs text-[#2563EB] hover:underline flex items-center gap-1 truncate"
                                            title={item.destination_url}
                                        >
                                            <span className="truncate">{item.destination_url}</span>
                                            <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-70" />
                                        </a>
                                    </td>
                                    <td className="px-4 py-3.5 text-center">
                                        <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 dark:bg-neutral-800 text-[#111111] dark:text-neutral-200">
                                            {item.clicks || 0}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5 text-xs text-[#666666] dark:text-neutral-400">
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3.5 text-right">
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(item.id, item.slug)}
                                            title="Delete link"
                                            className="text-[#666666] dark:text-neutral-400 hover:text-red-600 p-1 rounded transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {links.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-[#666666] dark:text-neutral-400 text-sm">
                                        No short links created yet.
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
