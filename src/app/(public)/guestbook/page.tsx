import { createPublicClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { GuestbookClient } from '@/components/guestbook/GuestbookClient'
import { GuestbookEntry } from '@/lib/types'

export const revalidate = 60

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

    const initialEntries: GuestbookEntry[] = (entries ?? []) as GuestbookEntry[]

    return <GuestbookClient initialEntries={initialEntries} />
}
