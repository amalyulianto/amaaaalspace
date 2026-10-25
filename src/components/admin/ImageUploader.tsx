'use client'

import { useEffect, useRef, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { generateSafeStorageFilename, sanitizeUrl, validateImageFile } from '@/lib/security'

interface ImageUploaderProps {
    onUpload: (url: string) => void
    currentUrl?: string
    label?: string
}

export default function ImageUploader({ onUpload, currentUrl, label = 'Cover Image' }: ImageUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState('')
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(
        sanitizeUrl(currentUrl) ?? undefined
    )

    useEffect(() => {
        setPreviewUrl(sanitizeUrl(currentUrl) ?? undefined)
    }, [currentUrl])

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const validation = validateImageFile(file)
        if (!validation.valid) {
            setErrorMessage(validation.error || 'Invalid file.')
            setUploadStatus('error')
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
            return
        }

        setUploading(true)
        setUploadStatus('idle')
        setErrorMessage('')

        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const path = `covers/${generateSafeStorageFilename(file.name)}`

        const { error } = await supabase.storage
            .from('images')
            .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type })

        if (error) {
            console.error('Upload error', error)
            setErrorMessage('Upload failed. Please try again.')
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
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />

                {uploadStatus === 'success' && <span className="text-green-600 text-sm font-medium">Upload complete</span>}
                {uploadStatus === 'error' && (
                    <span className="text-red-600 text-sm font-medium">
                        {errorMessage || 'Upload failed. Try again.'}
                    </span>
                )}
            </div>
        </div>
    )
}
