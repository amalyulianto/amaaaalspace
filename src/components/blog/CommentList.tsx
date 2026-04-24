import { createClient } from '@/lib/supabase/server'
import { Comment } from '@/lib/types'

interface CommentListProps {
    postId: string
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

export default async function CommentList({ postId }: CommentListProps) {
    const supabase = createClient()

    const { data } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .eq('approved', true)
        .order('created_at', { ascending: true })

    const comments: Comment[] = data ?? []

    if (comments.length === 0) {
        return (
            <p className="text-neutral-500 dark:text-neutral-400 text-[0.95rem]">
                Belum ada komeng. Sule aja kali ya?
            </p>
        )
    }

    return (
        <div className="space-y-6">
            {comments.map((comment) => (
                <div key={comment.id} className="border-b border-neutral-100 dark:border-neutral-800 pb-6 last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-[0.95rem] text-neutral-900 dark:text-neutral-100">{comment.author_name}</span>
                        <span className="text-[0.8rem] text-neutral-500 dark:text-neutral-400">{formatDate(comment.created_at)}</span>
                    </div>
                    <p className="text-[0.95rem] text-neutral-800 dark:text-neutral-300 m-0">{comment.content}</p>
                </div>
            ))}
        </div>
    )
}
