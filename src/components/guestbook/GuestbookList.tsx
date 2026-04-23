import { createClient } from '@/lib/supabase/server'
import { GuestbookEntry } from '@/lib/types'

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

function getInitials(name: string) {
    return name.slice(0, 2).toUpperCase()
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
            <p className="text-[#666666] text-[1.1rem]">
                No traces left behind yet.
            </p>
        )
    }

    return (
        <div className="columns-1 sm:columns-2 gap-6 space-y-6">
            {entries.map((entry) => (
                <div
                    key={entry.id}
                    className="break-inside-avoid bg-white border border-[#E5E7EB] p-6 rounded-[1.5rem] shadow-sm hover:shadow-md transition-shadow relative"
                >
                    <p className="text-[1.1rem] text-[#111111] mb-8 leading-relaxed font-serif relative z-10">
                        &quot;{entry.message}&quot;
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-bold text-neutral-600 shrink-0">
                            {getInitials(entry.author_name)}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-[0.95rem] text-[#111111] leading-tight mb-0.5">{entry.author_name}</span>
                            <span className="text-[0.75rem] text-[#666666] leading-tight">{formatDate(entry.created_at)}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
