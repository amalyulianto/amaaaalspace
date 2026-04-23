import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
    const supabase = createAdminClient()

    await supabase
        .from('posts')
        .select('count(*)', { count: 'exact', head: true })

    return NextResponse.json({ ok: true })
}
