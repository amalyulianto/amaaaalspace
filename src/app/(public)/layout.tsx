import SiteHeader from '@/components/layout/SiteHeader'
import Footer from '@/components/layout/Footer'

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col bg-white text-neutral-900 font-sans selection:bg-neutral-200">
            <SiteHeader />
            <main className="flex-1 max-w-3xl mx-auto w-full px-6 pb-12 pt-2 md:pt-4">
                {children}
            </main>
            <Footer />
        </div>
    )
}
