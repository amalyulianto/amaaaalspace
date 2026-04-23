import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
    let body: Record<string, unknown>

    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { post_id, author_name, content, website } = body as {
        post_id: string
        author_name: string
        content: string
        website: string
    }

    // Honeypot check
    if (website && website.trim() !== '') {
        return NextResponse.json({}, { status: 200 })
    }

    // Validate required fields
    if (
        !post_id || typeof post_id !== 'string' ||
        !author_name || typeof author_name !== 'string' ||
        !content || typeof content !== 'string'
    ) {
        return NextResponse.json({ error: 'Invalid' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase
        .from('comments')
        .insert({ post_id, author_name, content, approved: false })

    if (error) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({}, { status: 201 })
}
