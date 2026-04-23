import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
    let body: Record<string, unknown>

    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { author_name, message, website } = body as {
        author_name: string
        message: string
        website: string
    }

    // Honeypot check
    if (website && website.trim() !== '') {
        return NextResponse.json({}, { status: 200 })
    }

    // Validate required fields
    if (
        !author_name || typeof author_name !== 'string' ||
        !message || typeof message !== 'string'
    ) {
        return NextResponse.json({ error: 'Invalid' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase
        .from('guestbook')
        .insert({ author_name, message, approved: false })

    if (error) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({}, { status: 201 })
}
