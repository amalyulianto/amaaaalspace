import { NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase/server'

export async function GET() {
    const supabase = createPublicClient()

    await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published')

    return NextResponse.json({ ok: true })
}
