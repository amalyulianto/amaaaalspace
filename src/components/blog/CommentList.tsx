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
            <p className="text-[#666666] text-[0.95rem]">
                No comments yet. Be the first!
            </p>
        )
    }

    return (
        <div className="space-y-6">
            {comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-[0.95rem]">{comment.author_name}</span>
                        <span className="text-[0.8rem] text-[#666666]">{formatDate(comment.created_at)}</span>
                    </div>
                    <p className="text-[0.95rem] text-[#111111] m-0">{comment.content}</p>
                </div>
            ))}
        </div>
    )
}
