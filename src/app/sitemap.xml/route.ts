import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
    const supabase = createAdminClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

    const { data: posts } = await supabase
        .from('posts')
        .select('slug, updated_at')
        .eq('status', 'published')

    const staticPages = ['/', '/blog', '/portfolio', '/resume', '/guestbook']

    const staticUrls = staticPages
        .map(
            (path) => `
  <url>
    <loc>${siteUrl}${path}</loc>
    <changefreq>weekly</changefreq>
  </url>`
        )
        .join('')

    const postUrls = (posts ?? [])
        .map(
            (post) => `
  <url>
    <loc>${siteUrl}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.updated_at).toISOString().split('T')[0]}</lastmod>
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
            'Content-Type': 'application/xml',
        },
    })
}
