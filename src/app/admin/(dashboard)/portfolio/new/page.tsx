'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import ImageUploader from '@/components/admin/ImageUploader'
import TiptapEditor from '@/components/admin/TiptapEditor'
import { PortfolioCategory } from '@/lib/types'
import { sanitizeHtml, sanitizeUrl } from '@/lib/security'

export default function NewPortfolioPage() {
    const router = useRouter()

    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [description, setDescription] = useState('')
    const [content, setContent] = useState('')
    const [techStackInput, setTechStackInput] = useState('')
    const [coverImageUrl, setCoverImageUrl] = useState('')
    const [projectUrl, setProjectUrl] = useState('')
    const [playStoreUrl, setPlayStoreUrl] = useState('')
    const [appStoreUrl, setAppStoreUrl] = useState('')
    const [githubUrl, setGithubUrl] = useState('')
    const [displayOrder, setDisplayOrder] = useState<number>(0)
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
    const [isSelected, setIsSelected] = useState<boolean>(false)
    const [newCategoryName, setNewCategoryName] = useState('')

    const [portfolioCategories, setPortfolioCategories] = useState<PortfolioCategory[]>([])

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const generateSlug = (text: string) => {
        return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }

    const fetchCategories = async () => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data } = await supabase.from('portfolio_categories').select('*').order('name')
        if (data) setPortfolioCategories(data as PortfolioCategory[])
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const newSlug = generateSlug(newCategoryName)
        const { error } = await supabase.from('portfolio_categories').insert({ name: newCategoryName.trim(), slug: newSlug })
        if (error) {
            alert('Failed to add category')
        } else {
            setNewCategoryName('')
            fetchCategories()
        }
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value
        setTitle(newTitle)
        setSlug(generateSlug(newTitle))
    }

    const handleSave = async () => {
        if (!title || !slug) {
            setError('Title and slug are required.')
            return
        }

        const urlFields = [
            { label: 'Public Link', value: projectUrl },
            { label: 'Play Store Link', value: playStoreUrl },
            { label: 'Apple Store Link', value: appStoreUrl },
            { label: 'GitHub Link', value: githubUrl },
        ]

        for (const field of urlFields) {
            if (field.value.trim() && !sanitizeUrl(field.value)) {
                setError(`${field.label} must be a valid http:// or https:// URL.`)
                return
            }
        }

        setLoading(true)
        setError('')

        const tech_stack = techStackInput
            .split(',')
            .map(s => s.trim())
            .filter(s => s !== '')

        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data: insertedProject, error: insertError } = await supabase.from('portfolio').insert({
            title: title.trim(),
            slug: slug.trim(),
            description,
            content: sanitizeHtml(content),
            tech_stack,
            cover_image_url: sanitizeUrl(coverImageUrl),
            project_url: sanitizeUrl(projectUrl),
            play_store_url: sanitizeUrl(playStoreUrl),
            app_store_url: sanitizeUrl(appStoreUrl),
            github_url: sanitizeUrl(githubUrl),
            display_order: displayOrder,
            is_selected: isSelected
        }).select().single()

        if (insertError) {
            setError(insertError.message)
            setLoading(false)
            return
        }

        if (selectedCategoryIds.length > 0 && insertedProject) {
            const mappings = selectedCategoryIds.map(catId => ({
                portfolio_id: insertedProject.id,
                category_id: catId
            }))
            const { error: mappingError } = await supabase.from('portfolio_category_mapping').insert(mappings)
            if (mappingError) {
                console.error("Failed to insert category mappings:", mappingError)
            }
        }

        router.push('/admin/portfolio')
        router.refresh()
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="space-y-3 border-b border-border pb-5">
                <Link
                    href="/admin/portfolio"
                    className="inline-flex items-center text-xs text-secondary hover:text-foreground transition-colors no-underline"
                >
                    &larr; Back to Portfolio
                </Link>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        New Portfolio Project 🪄
                    </h1>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-foreground text-background px-5 py-2 rounded-lg text-xs sm:text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity self-start sm:self-auto"
                    >
                        {loading ? 'Saving...' : 'Save Project'}
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
                            placeholder="Project title..."
                            className="w-full px-3.5 py-2 border border-border bg-background rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-secondary">Slug</label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="project-slug"
                            className="w-full px-3.5 py-2 border border-border bg-background rounded-lg text-sm font-mono text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-secondary">Description (Short)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        placeholder="Short description shown on the portfolio list..."
                        className="w-full px-3.5 py-2 border border-border bg-background rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors leading-relaxed"
                    />
                </div>

                <div className="p-5 rounded-xl border border-border bg-surface/30 space-y-5">
                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-secondary">Categories</label>
                        <div className="flex flex-wrap gap-3">
                            {portfolioCategories.map((cat) => (
                                <label
                                    key={cat.id}
                                    htmlFor={`cat-${cat.id}`}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground cursor-pointer hover:border-foreground/30 transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        id={`cat-${cat.id}`}
                                        checked={selectedCategoryIds.includes(cat.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedCategoryIds((prev) => [...prev, cat.id])
                                            } else {
                                                setSelectedCategoryIds((prev) => prev.filter((id) => id !== cat.id))
                                            }
                                        }}
                                        className="w-3.5 h-3.5 rounded border-border accent-foreground"
                                    />
                                    <span>{cat.name}</span>
                                </label>
                            ))}
                            {portfolioCategories.length === 0 && (
                                <span className="text-xs text-muted">No categories found.</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="text"
                                placeholder="New Category"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="w-44 px-3 py-1.5 border border-border bg-background rounded-lg text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors"
                            />
                            <button
                                type="button"
                                onClick={handleAddCategory}
                                className="bg-surface border border-border px-3.5 py-1.5 rounded-lg text-xs font-medium text-foreground hover:border-foreground/30 transition-colors"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border/60 items-center">
                        <label
                            htmlFor="isSelected"
                            className="inline-flex items-center gap-2.5 cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                id="isSelected"
                                checked={isSelected}
                                onChange={(e) => setIsSelected(e.target.checked)}
                                className="w-4 h-4 rounded border-border accent-foreground"
                            />
                            <span className="text-xs sm:text-sm font-medium text-foreground">
                                ⭐ Mark as Highlighted Project
                            </span>
                        </label>

                        <div className="flex items-center gap-3">
                            <label className="text-xs font-medium text-secondary">
                                Display Order:
                            </label>
                            <input
                                type="number"
                                value={displayOrder}
                                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                                className="w-24 px-3 py-1.5 border border-border bg-background rounded-lg text-sm font-mono text-foreground focus:outline-none focus:border-foreground/50 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 pt-3 border-t border-border/60">
                        <label className="block text-xs font-medium text-secondary">Tech Stack</label>
                        <input
                            type="text"
                            value={techStackInput}
                            onChange={(e) => setTechStackInput(e.target.value)}
                            placeholder="Flutter, Dart, Firebase"
                            className="w-full px-3.5 py-2 border border-border bg-background rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors"
                        />
                        <p className="text-muted text-[11px]">Comma-separated values.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-border/60">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-secondary">Public Link</label>
                            <input
                                type="url"
                                value={projectUrl}
                                onChange={(e) => setProjectUrl(e.target.value)}
                                placeholder="https://example.com"
                                className="w-full px-3.5 py-2 border border-border bg-background rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-secondary">Play Store Link</label>
                            <input
                                type="url"
                                value={playStoreUrl}
                                onChange={(e) => setPlayStoreUrl(e.target.value)}
                                placeholder="https://play.google.com/store/apps/..."
                                className="w-full px-3.5 py-2 border border-border bg-background rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-secondary">Apple Store Link</label>
                            <input
                                type="url"
                                value={appStoreUrl}
                                onChange={(e) => setAppStoreUrl(e.target.value)}
                                placeholder="https://apps.apple.com/app/..."
                                className="w-full px-3.5 py-2 border border-border bg-background rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-secondary">GitHub Link</label>
                            <input
                                type="url"
                                value={githubUrl}
                                onChange={(e) => setGithubUrl(e.target.value)}
                                placeholder="https://github.com/..."
                                className="w-full px-3.5 py-2 border border-border bg-background rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="pt-3 border-t border-border/60">
                        <ImageUploader onUpload={setCoverImageUrl} currentUrl={coverImageUrl} />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-xs font-medium text-secondary">
                        Full Content (Blog Style)
                    </label>
                    <TiptapEditor content={content} onChange={setContent} />
                </div>

                <div className="pt-6 border-t border-border flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-foreground text-background px-6 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity text-xs sm:text-sm font-medium w-full sm:w-auto"
                    >
                        {loading ? 'Saving...' : 'Save Project'}
                    </button>
                </div>
            </div>
        </div>
    )
}
