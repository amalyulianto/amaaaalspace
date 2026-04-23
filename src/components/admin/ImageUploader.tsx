'use client'

import { useRef, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface ImageUploaderProps {
    onUpload: (url: string) => void
    currentUrl?: string
    label?: string
}

export default function ImageUploader({ onUpload, currentUrl, label = 'Cover Image' }: ImageUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentUrl)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        setUploadStatus('idle')

        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const timestamp = new Date().getTime()
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')
        const path = `covers/${timestamp}-${safeName}`

        const { data, error } = await supabase.storage.from('images').upload(path, file, { cacheControl: '3600', upsert: false })

        if (error) {
            console.error('Upload error', error)
            alert(`Upload failed: ${error.message}`)
            setUploadStatus('error')
            setUploading(false)
            return
        }

        const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(path)
        const url = publicUrlData.publicUrl

        setPreviewUrl(url)
        setUploadStatus('success')
        setUploading(false)
        onUpload(url)

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div>
            <label className="block text-sm font-medium text-[#666666] mb-2">{label}</label>

            {previewUrl && (
                <div className="mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt="Preview" className="max-w-full h-auto max-h-48 rounded border border-[#E5E7EB] object-cover" />
                </div>
            )}

            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="bg-white border border-[#E5E7EB] text-[#111111] px-4 py-2 rounded text-sm hover:bg-gray-50 focus:outline-none disabled:opacity-50 transition-colors"
                >
                    {uploading ? 'Uploading...' : 'Choose image'}
                </button>
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />

                {uploadStatus === 'success' && <span className="text-green-600 text-sm font-medium">Upload complete</span>}
                {uploadStatus === 'error' && <span className="text-red-600 text-sm font-medium">Upload failed. Try again.</span>}
            </div>
        </div>
    )
}
