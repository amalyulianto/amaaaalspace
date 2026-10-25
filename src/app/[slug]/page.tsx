import { notFound } from 'next/navigation'
import { createPublicClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import RedirectScreen from '@/components/ui/RedirectScreen'
import { sanitizeUrl } from '@/lib/security'

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

    if (!rawSlug || RESERVED_SLUGS.has(rawSlug) || !/^[a-z0-9-_]+$/.test(rawSlug)) {
        notFound()
    }

    const supabase = createPublicClient()

    const { data: link, error } = await supabase
        .from('short_links')
        .select('destination_url')
        .eq('slug', rawSlug)
        .single()

    const safeDestinationUrl = sanitizeUrl(link?.destination_url)

    if (error || !safeDestinationUrl) {
        notFound()
    }

    // Increment click count atomically using server-only admin client
    try {
        const adminSupabase = createAdminClient()
        await adminSupabase.rpc('increment_link_clicks', { link_slug: rawSlug })
    } catch {
        // Continue redirection even if RPC encounters an error
    }

    return <RedirectScreen destinationUrl={safeDestinationUrl} />
}
