import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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

    // Increment click count atomically (non-blocking failure tolerance)
    try {
        await supabase.rpc('increment_link_clicks', { link_slug: rawSlug })
    } catch {
        // Continue redirection even if click increment encounters an error
    }

    redirect(link.destination_url)
}
