export async function GET() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

    const body = `User-agent: *
Allow: /
Disallow: /admin
Sitemap: ${siteUrl}/sitemap.xml`

    return new Response(body, {
        headers: {
            'Content-Type': 'text/plain',
        },
    })
}
