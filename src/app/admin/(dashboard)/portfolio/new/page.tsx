'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import ImageUploader from '@/components/admin/ImageUploader'
import TiptapEditor from '@/components/admin/TiptapEditor'

export default function NewPortfolioPage() {
    const router = useRouter()

    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [description, setDescription] = useState('')
    const [content, setContent] = useState('')
    const [techStackInput, setTechStackInput] = useState('')
    const [coverImageUrl, setCoverImageUrl] = useState('')
    const [projectUrl, setProjectUrl] = useState('')
    const [githubUrl, setGithubUrl] = useState('')
    const [displayOrder, setDisplayOrder] = useState<number>(0)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const generateSlug = (text: string) => {
        return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
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

        const { error: insertError } = await supabase.from('portfolio').insert({
            title,
            slug,
            description,
            content,
            tech_stack,
            cover_image_url: coverImageUrl || null,
            project_url: projectUrl || null,
            github_url: githubUrl || null,
            display_order: displayOrder
        })

        if (insertError) {
            setError(insertError.message)
            setLoading(false)
        } else {
            router.push('/admin/portfolio')
            router.refresh()
        }
    }

    return (
        <div className="max-w-3xl">
            <h1 className="text-2xl font-bold text-[#111111] mb-8">New Portfolio Project</h1>

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
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#666666] mb-1">Description (Short)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#666666] mb-1">Full Content (Blog Style)</label>
                    <TiptapEditor content={content} onChange={setContent} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#666666] mb-1">Tech Stack</label>
                    <input
                        type="text"
                        value={techStackInput}
                        onChange={(e) => setTechStackInput(e.target.value)}
                        placeholder="Flutter, Dart, Firebase"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                    />
                    <p className="text-xs text-gray-500 mt-1">Comma-separated values.</p>
                </div>

                <div>
                    <ImageUploader onUpload={setCoverImageUrl} currentUrl={coverImageUrl} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[#666666] mb-1">Project URL</label>
                        <input
                            type="url"
                            value={projectUrl}
                            onChange={(e) => setProjectUrl(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#666666] mb-1">GitHub URL</label>
                        <input
                            type="url"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#666666] mb-1">Display Order</label>
                    <input
                        type="number"
                        value={displayOrder}
                        onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                        className="w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                    />
                </div>

                <div className="pt-4 border-t border-[#E5E7EB]">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-[#2563EB] text-white px-6 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Saving...' : 'Save Project'}
                    </button>
                </div>
            </div>
        </div>
    )
}
