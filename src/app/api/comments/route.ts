import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
    checkRateLimit,
    getClientIp,
    isValidUuid,
    verifySameOrigin,
} from '@/lib/security'

const MAX_AUTHOR_LENGTH = 80
const MAX_CONTENT_LENGTH = 1000
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000 // 10 minutes

export async function POST(request: Request) {
    let body: Record<string, unknown>

    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { post_id, author_name, content, website } = body as {
        post_id?: unknown
        author_name?: unknown
        content?: unknown
        website?: unknown
    }

    // Honeypot check: return HTTP 200 immediately without saving
    if (typeof website === 'string' && website.trim() !== '') {
        return NextResponse.json({}, { status: 200 })
    }

    if (!verifySameOrigin(request)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const ip = getClientIp(request)
    if (!checkRateLimit(`comments:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    if (
        typeof post_id !== 'string' ||
        !isValidUuid(post_id) ||
        typeof author_name !== 'string' ||
        typeof content !== 'string'
    ) {
        return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const trimmedAuthor = author_name.trim()
    const trimmedContent = content.trim()

    if (
        !trimmedAuthor ||
        trimmedAuthor.length > MAX_AUTHOR_LENGTH ||
        !trimmedContent ||
        trimmedContent.length > MAX_CONTENT_LENGTH
    ) {
        return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Ensure target post exists and is currently published
    const { data: publishedPost } = await supabase
        .from('posts')
        .select('id')
        .eq('id', post_id.trim())
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString())
        .single()

    if (!publishedPost) {
        return NextResponse.json({ error: 'Invalid post' }, { status: 400 })
    }

    const { error } = await supabase
        .from('comments')
        .insert({
            post_id: publishedPost.id,
            author_name: trimmedAuthor,
            content: trimmedContent,
            approved: false,
        })

    if (error) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({}, { status: 201 })
}
