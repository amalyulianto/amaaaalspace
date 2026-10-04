import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RedirectScreen from '@/components/ui/RedirectScreen'

interface ShortLinkPageProps {
    params: {
        slug: string
    }
}

const RESERVED_SLUGS = new Set([
    'blog',
    'portfolio',
    'resume',
    'guestbook',
    'links',
    'me',
    'admin',
    'api',
    'robots.txt',
    'sitemap.xml',
    'favicon.ico',
])

export default async function ShortLinkPage({ params }: ShortLinkPageProps) {
    const rawSlug = params.slug?.toLowerCase()

    if (!rawSlug || RESERVED_SLUGS.has(rawSlug)) {
        notFound()
    }

    const supabase = createClient()

    const { data: link, error } = await supabase
        .from('short_links')
        .select('destination_url')
        .eq('slug', rawSlug)
        .single()

    if (error || !link?.destination_url) {
        notFound()
    }

    // Increment click count atomically
    try {
        await supabase.rpc('increment_link_clicks', { link_slug: rawSlug })
    } catch {
        // Continue even if RPC encounters an error
    }

    return <RedirectScreen destinationUrl={link.destination_url} />
}
