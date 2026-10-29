import { createPublicClient } from '@/lib/supabase/server'
import { escapeXml } from '@/lib/security'

export async function GET() {
    const supabase = createPublicClient()
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/+$/, '')

    const { data: posts } = await supabase
        .from('posts')
        .select('slug, updated_at')
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString())

    const staticPages = ['/', '/alapakadala', '/blog', '/portfolio', '/resume', '/guestbook']

    const staticUrls = staticPages
        .map(
            (path) => `
  <url>
    <loc>${escapeXml(`${siteUrl}${path}`)}</loc>
    <changefreq>weekly</changefreq>
  </url>`
        )
        .join('')

    const postUrls = (posts ?? [])
        .map(
            (post) => `
  <url>
    <loc>${escapeXml(`${siteUrl}/blog/${encodeURIComponent(post.slug)}`)}</loc>
    <lastmod>${escapeXml(new Date(post.updated_at).toISOString().split('T')[0])}</lastmod>
    <changefreq>monthly</changefreq>
  </url>`
        )
        .join('')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${postUrls}
</urlset>`

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
        },
    })
}
