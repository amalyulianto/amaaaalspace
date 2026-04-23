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
                <p className="text-[#666666] text-[0.95rem]">
                    Thanks for visiting! Your message will appear after review.
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
                        <label htmlFor="guestbook-name" className="block text-[0.9rem] font-medium mb-1">
                            Name
                        </label>
                        <input
                            id="guestbook-name"
                            type="text"
                            name="author_name"
                            required
                            className="w-full border border-gray-200 rounded px-3 py-2 text-[0.95rem] focus:outline-none focus:border-blue-600"
                        />
                    </div>

                    <div>
                        <label htmlFor="guestbook-message" className="block text-[0.9rem] font-medium mb-1">
                            Message
                        </label>
                        <textarea
                            id="guestbook-message"
                            name="message"
                            required
                            rows={3}
                            className="w-full border border-gray-200 rounded px-3 py-2 text-[0.95rem] focus:outline-none focus:border-blue-600 resize-y"
                        />
                    </div>

                    {status === 'error' && (
                        <p className="text-red-600 text-[0.9rem]">
                            Something went wrong. Please try again.
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="bg-blue-600 text-white px-4 py-2 rounded text-[0.9rem] hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {status === 'loading' ? 'Sending...' : 'Sign guestbook'}
                    </button>
                </form>
            )}
        </div>
    )
}
