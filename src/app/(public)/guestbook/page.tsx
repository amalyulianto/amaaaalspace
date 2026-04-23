import { createPublicClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { GuestbookClient, GuestbookMessage } from '@/components/guestbook/GuestbookClient'

export const revalidate = 60;

export const metadata: Metadata = {
    title: 'Guestbook',
    description: 'Leave a message for Alapakadala.',
}

export default async function GuestbookPage() {
    const supabase = createPublicClient()

    const { data: entries } = await supabase
        .from('guestbook')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false })

    const formattedMessages: GuestbookMessage[] = (entries ?? []).map((entry) => ({
        id: entry.id,
        name: entry.author_name,
        message: entry.message,
        date: entry.created_at,
    }))

    return <GuestbookClient initialMessages={formattedMessages} />
}
