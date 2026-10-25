import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
    checkRateLimit,
    getClientIp,
    verifySameOrigin,
} from '@/lib/security'

const MAX_AUTHOR_LENGTH = 80
const MAX_MESSAGE_LENGTH = 1000
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000 // 10 minutes

export async function POST(request: Request) {
    let body: Record<string, unknown>

    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { author_name, message, website } = body as {
        author_name?: unknown
        message?: unknown
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
    if (!checkRateLimit(`guestbook:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    if (typeof author_name !== 'string' || typeof message !== 'string') {
        return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const trimmedAuthor = author_name.trim()
    const trimmedMessage = message.trim()

    if (
        !trimmedAuthor ||
        trimmedAuthor.length > MAX_AUTHOR_LENGTH ||
        !trimmedMessage ||
        trimmedMessage.length > MAX_MESSAGE_LENGTH
    ) {
        return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase
        .from('guestbook')
        .insert({
            author_name: trimmedAuthor,
            message: trimmedMessage,
            approved: false,
        })

    if (error) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({}, { status: 201 })
}
