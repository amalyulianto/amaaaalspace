'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import ImageUploader from '@/components/admin/ImageUploader'
import TiptapEditor from '@/components/admin/TiptapEditor'
import { PortfolioItem, PortfolioCategory } from '@/lib/types'

export default function EditPortfolioPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const { id } = params

    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [description, setDescription] = useState('')
    const [content, setContent] = useState('')
    const [techStackInput, setTechStackInput] = useState('')
    const [coverImageUrl, setCoverImageUrl] = useState('')
    const [projectUrl, setProjectUrl] = useState('')
    const [githubUrl, setGithubUrl] = useState('')
    const [displayOrder, setDisplayOrder] = useState<number>(0)
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
    const [isSelected, setIsSelected] = useState<boolean>(false)
    const [newCategoryName, setNewCategoryName] = useState('')

    const [portfolioCategories, setPortfolioCategories] = useState<PortfolioCategory[]>([])

    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchItemAndCategories()
    }, [])

    const fetchItemAndCategories = async () => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const [itemResponse, categoriesResponse] = await Promise.all([
            supabase.from('portfolio').select('*, portfolio_categories!portfolio_category_mapping(id)').eq('id', id).single(),
            supabase.from('portfolio_categories').select('*').order('name')
        ])

        if (categoriesResponse.data) {
            setPortfolioCategories(categoriesResponse.data as PortfolioCategory[])
        }

        if (itemResponse.data) {
            const item = itemResponse.data as PortfolioItem
            setTitle(item.title)
            setSlug(item.slug)
            setDescription(item.description || '')
            setContent(item.content || '')
            setTechStackInput(item.tech_stack?.join(', ') || '')
            setCoverImageUrl(item.cover_image_url || '')
            setProjectUrl(item.project_url || '')
            setGithubUrl(item.github_url || '')
            setDisplayOrder(item.display_order)
            setIsSelected(item.is_selected || false)
            if (item.portfolio_categories) {
                setSelectedCategoryIds(item.portfolio_categories.map(c => c.id))
            }
        }
        setFetching(false)
    }

    const generateSlug = (text: string) => {
        return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }

    const fetchCategoriesOnly = async () => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data } = await supabase.from('portfolio_categories').select('*').order('name')
        if (data) setPortfolioCategories(data as PortfolioCategory[])
    }

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const newSlug = generateSlug(newCategoryName)
        const { error } = await supabase.from('portfolio_categories').insert({ name: newCategoryName, slug: newSlug })
        if (error) {
            alert('Failed to add category')
        } else {
            setNewCategoryName('')
            fetchCategoriesOnly()
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

        const { error: updateError } = await supabase
            .from('portfolio')
            .update({
                title,
                slug,
                description,
                content,
                tech_stack,
                cover_image_url: coverImageUrl || null,
                project_url: projectUrl || null,
                github_url: githubUrl || null,
                display_order: displayOrder,
                is_selected: isSelected
            })
            .eq('id', id)

        if (updateError) {
            setError(updateError.message)
            setLoading(false)
            return
        }

        // Delete old mappings
        await supabase.from('portfolio_category_mapping').delete().eq('portfolio_id', id)

        // Insert new mappings
        if (selectedCategoryIds.length > 0) {
            const mappings = selectedCategoryIds.map(catId => ({
                portfolio_id: id,
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

    if (fetching) return <div className="text-[#666666]">Loading portfolio item...</div>

    return (
        <div>
            <div className="flex justify-between items-end mb-8 border-b border-[#E5E7EB] pb-4">
                <h1 className="text-xl font-bold text-[#111111]">Edit Portfolio Project</h1>
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
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">Description (Short)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-[#E5E7EB] rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-[#111111] transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">Category</label>
                    <div className="flex gap-2 items-center">
                        <div className="flex gap-4 flex-col items-start">
                            <div className="flex flex-col gap-2">
                                {portfolioCategories.map(cat => (
                                    <div key={cat.id} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id={`cat-${cat.id}`}
                                            checked={selectedCategoryIds.includes(cat.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedCategoryIds(prev => [...prev, cat.id])
                                                } else {
                                                    setSelectedCategoryIds(prev => prev.filter(catId => catId !== cat.id))
                                                }
                                            }}
                                            className="w-4 h-4 text-[#2563EB] border-[#E5E7EB] rounded focus:ring-[#2563EB]"
                                        />
                                        <label htmlFor={`cat-${cat.id}`} className="text-sm text-[#111111]">
                                            {cat.name}
                                        </label>
                                    </div>
                                ))}
                                {portfolioCategories.length === 0 && <span className="text-sm text-[#666666]">No categories found.</span>}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
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

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="isSelected"
                            checked={isSelected}
                            onChange={(e) => setIsSelected(e.target.checked)}
                            className="w-4 h-4 text-[#2563EB] border-[#E5E7EB] rounded focus:ring-[#2563EB]"
                        />
                        <label htmlFor="isSelected" className="text-sm font-medium text-[#111111]">
                            Mark as Selected Project
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#111111] mb-2">Full Content (Blog Style)</label>
                        <TiptapEditor content={content} onChange={setContent} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#111111] mb-2">Tech Stack</label>
                        <input
                            type="text"
                            value={techStackInput}
                            onChange={(e) => setTechStackInput(e.target.value)}
                            placeholder="Flutter, Dart, Firebase"
                            className="w-full px-4 py-2 border border-[#E5E7EB] rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-[#111111] transition-colors"
                        />
                        <p className="text-[#666666] text-[13px] mt-2">Comma-separated values.</p>
                    </div>

                    <div>
                        <ImageUploader onUpload={setCoverImageUrl} currentUrl={coverImageUrl} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[#111111] mb-2">Project URL</label>
                            <input
                                type="url"
                                value={projectUrl}
                                onChange={(e) => setProjectUrl(e.target.value)}
                                className="w-full px-4 py-2 border border-[#E5E7EB] rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-[#111111] transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#111111] mb-2">GitHub URL</label>
                            <input
                                type="url"
                                value={githubUrl}
                                onChange={(e) => setGithubUrl(e.target.value)}
                                className="w-full px-4 py-2 border border-[#E5E7EB] rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-[#111111] transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#111111] mb-2">Display Order</label>
                        <input
                            type="number"
                            value={displayOrder}
                            onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                            className="w-32 px-4 py-2 border border-[#E5E7EB] rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] text-[#111111] transition-colors"
                        />
                    </div>

                    <div className="pt-6 mt-6 border-t border-[#E5E7EB]">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-[#111111] text-white px-6 py-2.5 rounded hover:bg-[#2563EB] disabled:opacity-50 transition-colors font-medium w-full sm:w-auto"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div></div>
    )
}
