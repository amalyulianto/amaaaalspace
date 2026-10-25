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
        <div className="space-y-2.5">
            <label className="block text-xs font-medium text-secondary">{label}</label>

            {previewUrl && (
                <div className="mb-3 rounded-xl overflow-hidden border border-border bg-surface/50 inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-full h-auto max-h-48 object-cover block"
                    />
                </div>
            )}

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="bg-surface border border-border text-foreground px-3.5 py-2 rounded-lg text-xs font-medium hover:border-foreground/30 focus:outline-none disabled:opacity-50 transition-colors"
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

                {uploadStatus === 'success' && (
                    <span className="text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                        Upload complete
                    </span>
                )}
                {uploadStatus === 'error' && (
                    <span className="text-red-500 text-xs font-medium">
                        {errorMessage || 'Upload failed. Try again.'}
                    </span>
                )}
            </div>
        </div>
    )
}
