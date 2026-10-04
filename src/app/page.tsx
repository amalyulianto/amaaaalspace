import Link from 'next/link'

export default function StudioLandingPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-neutral-100 flex flex-col justify-between p-6 sm:p-12 antialiased selection:bg-neutral-800 selection:text-white">

            {/* Main Information */}
            <main className="w-full max-w-3xl mx-auto my-auto py-16 flex flex-col items-center text-center">
                <div className="space-y-6 max-w-xl">
                    <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-white">
                        Alapakadala Studio
                    </h1>

                    <div className="inline-block py-1 px-3 rounded-full border border-neutral-800 bg-neutral-900/60 text-xs font-mono text-neutral-300 tracking-wider">
                        — Site Under Construction —
                    </div>

                    <p className="text-sm sm:text-base text-neutral-400 font-light leading-relaxed max-w-md mx-auto">
                        This digital space is currently being built and curated. More updates and work will be published here soon.
                    </p>
                </div>
            </main>

            {/* Bottom Section - Low-key, subtle, non-CTA reference */}
            <footer className="w-full max-w-3xl mx-auto flex justify-center pb-2 sm:pb-4">
                <Link
                    href="/me"
                    className="text-[11px] text-neutral-400 hover:text-neutral-200 transition-colors font-light underline underline-offset-4 decoration-neutral-700 hover:decoration-neutral-400"
                >
                    Visit a man&apos;s personal site instead
                </Link>
            </footer>
        </div>
    )
}
