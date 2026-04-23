import { useState, useRef } from 'react'

interface CommentFormProps {
    postId: string
}

export default function CommentForm({ postId }: CommentFormProps) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const formRef = useRef<HTMLFormElement>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setStatus('loading')

        const form = e.currentTarget
        const formData = new FormData(form)

        const body = {
            post_id: postId,
            author_name: formData.get('author_name') as string,
            content: formData.get('content') as string,
            website: formData.get('website') as string,
        }

        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })

            if (res.ok) {
                setStatus('success')
                formRef.current?.reset()
            } else {
                setStatus('error')
            }
        } catch {
            setStatus('error')
        }
    }

    return (
        <div>
            <h3 className="text-[1rem] font-semibold mb-4">Tinggalkan Komengtar</h3>

            {status === 'success' ? (
                <p className="text-[#666666] text-[0.95rem]">
                    Makasih udah komeng. Kalau mood, nanti kutampilin di sini.
                </p>
            ) : (
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                    {/* Honeypot */}
                    <input
                        type="text"
                        name="website"
                        style={{ display: 'none', visibility: 'hidden' }}
                        tabIndex={-1}
                        autoComplete="off"
                    />

                    <div>
                        <label htmlFor="comment-name" className="block text-[0.9rem] font-medium mb-1">
                            Nama
                        </label>
                        <input
                            id="comment-name"
                            type="text"
                            name="author_name"
                            required
                            className="w-full border border-gray-200 rounded px-3 py-2 text-[0.95rem] focus:outline-none focus:border-blue-600"
                        />
                    </div>

                    <div>
                        <label htmlFor="comment-content" className="block text-[0.9rem] font-medium mb-1">
                            Komengmu
                        </label>
                        <textarea
                            id="comment-content"
                            name="content"
                            required
                            rows={4}
                            className="w-full border border-gray-200 rounded px-3 py-2 text-[0.95rem] focus:outline-none focus:border-blue-600 resize-y"
                        />
                    </div>

                    {status === 'error' && (
                        <p className="text-red-600 text-[0.9rem]">
                            Hmm ada yang salah. Maap lah ya.
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="bg-blue-600 text-white px-4 py-2 rounded text-[0.9rem] hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {status === 'loading' ? 'Posting...' : 'Post comment'}
                    </button>
                </form>
            )}
        </div>
    )
}
