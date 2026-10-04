import Link from 'next/link'
import { ArrowRight, Hammer } from 'lucide-react'

export default function StudioHomePage() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-500">
            <div className="space-y-6 max-w-xl">
                {/* Construction badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                    <Hammer className="w-3.5 h-3.5" />
                    <span>Site Under Construction</span>
                </div>

                {/* Studio Title */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
                    Alapakadala Studio
                </h1>

                {/* Subtext */}
                <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                    Visit a man&apos;s personal site instead
                </p>

                {/* CTA Button */}
                <div className="pt-4 flex justify-center">
                    <Link
                        href="/me"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-base font-medium bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all duration-200 shadow-sm hover:shadow"
                    >
                        <span>Visit Personal Site</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
