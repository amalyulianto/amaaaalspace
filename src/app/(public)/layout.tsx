import SiteHeader from '@/components/layout/SiteHeader'
import Footer from '@/components/layout/Footer'
import Container from '@/components/layout/Container'

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col font-sans">
            <SiteHeader />
            <main className="w-full pt-0 pb-12">
                <Container>
                    {children}
                </Container>
            </main>
            <Footer />
        </div>
    )
}
