'use client'

import { useState, useRef } from 'react'

export default function GuestbookForm() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const formRef = useRef<HTMLFormElement>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setStatus('loading')

        const form = e.currentTarget
        const formData = new FormData(form)

        const body = {
            author_name: formData.get('author_name') as string,
            message: formData.get('message') as string,
            website: formData.get('website') as string,
        }

        try {
            const res = await fetch('/api/guestbook', {
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
            {status === 'success' ? (
                <p className="text-[#111111] font-bold text-[1.2rem] py-4">
                    Thanks for leaving a trace! It will appear after review.
                </p>
            ) : (
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-8 max-w-lg">
                    {/* Honeypot */}
                    <input
                        type="text"
                        name="website"
                        style={{ display: 'none', visibility: 'hidden' }}
                        tabIndex={-1}
                        autoComplete="off"
                    />

                    <div>
                        <input
                            id="guestbook-name"
                            type="text"
                            name="author_name"
                            required
                            placeholder="Your name"
                            className="w-full bg-transparent border-0 border-b-2 border-[#E5E7EB] focus:border-[#111111] px-0 py-3 text-[1.2rem] focus:outline-none focus:ring-0 transition-colors placeholder:text-[#999999] font-medium"
                        />
                    </div>

                    <div>
                        <textarea
                            id="guestbook-message"
                            name="message"
                            required
                            rows={2}
                            placeholder="Leave a message..."
                            className="w-full bg-transparent border-0 border-b-2 border-[#E5E7EB] focus:border-[#111111] px-0 py-3 text-[1.2rem] focus:outline-none focus:ring-0 resize-none transition-colors placeholder:text-[#999999] font-medium"
                        />
                    </div>

                    {status === 'error' && (
                        <p className="text-red-600 font-medium">
                            Something went wrong. Please try again.
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="bg-neutral-900 text-white px-8 py-3 rounded-full font-medium tracking-wide text-sm hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center"
                    >
                        {status === 'loading' ? 'Signing...' : 'Leave a Note'}
                    </button>
                </form>
            )}
        </div>
    )
}
