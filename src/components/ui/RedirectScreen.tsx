'use client'

import { useEffect } from 'react'
import { ExternalLink } from 'lucide-react'

interface RedirectScreenProps {
    destinationUrl: string
}

export default function RedirectScreen({ destinationUrl }: RedirectScreenProps) {
    useEffect(() => {
        // Immediate client-side navigation trigger
        window.location.replace(destinationUrl)
    }, [destinationUrl])

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-300">
            <div className="space-y-6 max-w-md">
                {/* Spinner */}
                <div className="w-10 h-10 mx-auto rounded-full border-2 border-neutral-200 dark:border-neutral-800 border-t-[#2563EB] dark:border-t-[#2563EB] animate-spin" />

                <div className="space-y-2">
                    <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                        Redirecting...
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Taking you to{' '}
                        <span className="font-medium text-neutral-800 dark:text-neutral-200 break-all">
                            {destinationUrl}
                        </span>
                    </p>
                </div>

                <div className="pt-2">
                    <a
                        href={destinationUrl}
                        className="text-xs text-[#2563EB] hover:underline inline-flex items-center gap-1 font-medium"
                    >
                        <span>Click here if you are not redirected automatically</span>
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>
        </div>
    )
}
