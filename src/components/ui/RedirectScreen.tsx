'use client'

import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { sanitizeUrl } from '@/lib/security'

interface RedirectScreenProps {
    destinationUrl: string
}

export default function RedirectScreen({ destinationUrl }: RedirectScreenProps) {
    const [progress, setProgress] = useState(0)
    const safeUrl = sanitizeUrl(destinationUrl)

    useEffect(() => {
        if (!safeUrl) return

        // 2-second countdown with progress bar before redirecting
        const duration = 2000
        const intervalTime = 40
        const step = (intervalTime / duration) * 100

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer)
                    window.location.replace(safeUrl)
                    return 100
                }
                return prev + step
            })
        }, intervalTime)

        return () => clearInterval(timer)
    }, [safeUrl])

    if (!safeUrl) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 flex items-center justify-center p-6">
                <p className="text-sm text-neutral-400">Invalid destination URL.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 flex flex-col items-center justify-center p-6 antialiased select-none">
            <div className="w-full max-w-sm flex flex-col items-center text-center space-y-6">
                {/* Minimal animated spinner */}
                <div className="relative w-12 h-12 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-2 border-neutral-800 border-t-neutral-200 animate-spin" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-lg font-medium tracking-tight text-white">
                        Redirecting...
                    </h1>
                    <p className="text-xs text-neutral-400 break-all max-w-xs mx-auto leading-relaxed">
                        {safeUrl}
                    </p>
                </div>

                {/* Progress bar */}
                <div className="w-48 h-1 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800/80">
                    <div
                        className="h-full bg-neutral-300 transition-all duration-75 ease-linear rounded-full"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>

                {/* Direct fallback link */}
                <div className="pt-2">
                    <a
                        href={safeUrl}
                        rel="noopener noreferrer"
                        className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors inline-flex items-center gap-1.5"
                    >
                        <span>Click here if not redirected automatically</span>
                        <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                </div>
            </div>
        </div>
    )
}
