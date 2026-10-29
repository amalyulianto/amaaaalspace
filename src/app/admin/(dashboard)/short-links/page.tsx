'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { ShortLink } from '@/lib/types'
import { Copy, Check, Trash2, Plus, ExternalLink, RefreshCw } from 'lucide-react'
import { sanitizeUrl } from '@/lib/security'

const RESERVED_SLUGS = [
    'blog',
    'portfolio',
    'resume',
    'guestbook',
    'links',
    'me',
    'alapakadala',
    'admin',
    'api',
    'robots.txt',
    'sitemap.xml',
    'favicon.ico',
]

function generateRandomSlug(length = 6): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    const randomBytes = new Uint8Array(length)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues(randomBytes)
    } else {
        for (let i = 0; i < length; i++) {
            randomBytes[i] = Math.floor(Math.random() * 256)
        }
    }
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(randomBytes[i] % chars.length)
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
        const safeDestinationUrl = sanitizeUrl(destinationUrl)

        if (!safeDestinationUrl) {
            setError('Please enter a valid URL starting with http:// or https://')
            return
        }

        if (!trimmedSlug) {
            trimmedSlug = generateRandomSlug()
        }

        if (RESERVED_SLUGS.includes(trimmedSlug)) {
            setError(`"${trimmedSlug}" is a reserved system path and cannot be used as a short link.`)
            return
        }

        if (!/^[a-zA-Z0-9-_]+$/.test(trimmedSlug)) {
            setError('Slug can only contain letters, numbers, hyphens (-), and underscores (_).')
            return
        }

        setFormLoading(true)

        const { error: insertError } = await supabase
            .from('short_links')
            .insert({
                slug: trimmedSlug,
                destination_url: safeDestinationUrl,
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
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="border-b border-border pb-5 space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Short Links ⚡
                </h1>
                <p className="text-xs sm:text-sm text-secondary">
                    Create custom or random short URLs that redirect to external destinations.
                </p>
            </div>

            {error && (
                <div className="bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-500/20 text-xs sm:text-sm">
                    {error}
                </div>
            )}

            {/* Create Form */}
            <div className="bg-surface/40 p-6 rounded-xl border border-border">
                <h2 className="text-sm font-bold text-foreground mb-4">
                    Create New Short Link
                </h2>
                <form onSubmit={handleCreateLink} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-secondary">
                                Destination URL <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="url"
                                required
                                value={destinationUrl}
                                onChange={(e) => setDestinationUrl(e.target.value)}
                                placeholder="https://example.com/very/long/url"
                                className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="block text-xs font-medium text-secondary">
                                    Custom Slug (optional)
                                </label>
                                <button
                                    type="button"
                                    onClick={handleGenerateSlug}
                                    className="text-xs text-secondary hover:text-foreground underline underline-offset-4 flex items-center gap-1 font-medium transition-colors"
                                >
                                    <RefreshCw className="w-3 h-3" /> Random
                                </button>
                            </div>
                            <div className="flex items-center">
                                <span className="inline-flex items-center px-3 py-2 rounded-l-lg border border-r-0 border-border bg-surface text-xs font-mono text-muted select-none">
                                    /
                                </span>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder="e.g. 3dmath (or leave empty)"
                                    className="w-full px-3.5 py-2 bg-background border border-border rounded-r-lg text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={formLoading}
                            className="bg-foreground text-background px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1.5"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            {formLoading ? 'Creating...' : 'Create Short Link'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Links Table */}
            {loading ? (
                <div className="py-12 text-muted font-mono text-sm animate-pulse">
                    Loading short links...
                </div>
            ) : (
                <div className="bg-surface/20 border border-border rounded-xl overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-surface/70 border-b border-border text-xs font-mono uppercase tracking-wider text-muted">
                                <th className="px-4 py-3 font-medium">Short URL</th>
                                <th className="px-4 py-3 font-medium">Destination</th>
                                <th className="px-4 py-3 font-medium text-center w-24">Clicks</th>
                                <th className="px-4 py-3 font-medium w-28">Created</th>
                                <th className="px-4 py-3 font-medium text-right w-20">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {links.map((item) => {
                                const safeItemUrl = sanitizeUrl(item.destination_url)
                                return (
                                    <tr key={item.id} className="hover:bg-surface/50 transition-colors">
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-semibold text-foreground text-xs sm:text-sm">
                                                    /{item.slug}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(item.slug)}
                                                    title="Copy short link"
                                                    className="text-secondary hover:text-foreground p-1 rounded-md hover:bg-surface transition-colors"
                                                >
                                                    {copiedSlug === item.slug ? (
                                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                    ) : (
                                                        <Copy className="w-3.5 h-3.5" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 max-w-xs">
                                            {safeItemUrl ? (
                                                <a
                                                    href={safeItemUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-secondary hover:text-foreground hover:underline underline-offset-4 flex items-center gap-1 truncate transition-colors"
                                                    title={safeItemUrl}
                                                >
                                                    <span className="truncate">{safeItemUrl}</span>
                                                    <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-70" />
                                                </a>
                                            ) : (
                                                <span className="text-xs text-red-500 truncate">Invalid URL</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <span className="inline-block px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-surface border border-border text-foreground">
                                                {item.clicks || 0}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-xs font-mono text-muted">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(item.id, item.slug)}
                                                title="Delete link"
                                                className="text-muted hover:text-red-500 p-1.5 rounded-md hover:bg-surface transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                            {links.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-muted text-sm">
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
