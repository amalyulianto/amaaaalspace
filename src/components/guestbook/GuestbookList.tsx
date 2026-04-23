import { createClient } from '@/lib/supabase/server'
import { GuestbookEntry } from '@/lib/types'

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

export default async function GuestbookList() {
    const supabase = createClient()

    const { data } = await supabase
        .from('guestbook')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false })

    const entries: GuestbookEntry[] = data ?? []

    if (entries.length === 0) {
        return (
            <p className="text-[#666666] text-[0.95rem]">
                No messages yet. Be the first to say hello!
            </p>
        )
    }

    return (
        <div className="space-y-6">
            {entries.map((entry) => (
                <div key={entry.id} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-[0.95rem]">{entry.author_name}</span>
                        <span className="text-[0.8rem] text-[#666666]">{formatDate(entry.created_at)}</span>
                    </div>
                    <p className="text-[0.95rem] text-[#111111] m-0">{entry.message}</p>
                </div>
            ))}
        </div>
    )
}
