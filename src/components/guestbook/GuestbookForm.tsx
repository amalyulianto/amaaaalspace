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
                <p className="text-neutral-900 dark:text-neutral-100 font-bold text-[1.2rem] py-4">
                    Makasih dah ngisi. Nanti kutampilin kalo mood.
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
                            placeholder="Jok Mobil"
                            className="w-full bg-transparent border-0 border-b border-neutral-200 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-neutral-300 px-0 py-3 text-[1.2rem] focus:outline-none focus:ring-0 transition-colors placeholder:text-neutral-400 dark:placeholder:text-neutral-600 font-medium text-neutral-900 dark:text-neutral-100"
                        />
                    </div>

                    <div>
                        <textarea
                            id="guestbook-message"
                            name="message"
                            required
                            rows={2}
                            placeholder="Tulis di sini"
                            className="w-full bg-transparent border-0 border-b border-neutral-200 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-neutral-300 px-0 py-3 text-[1.2rem] focus:outline-none focus:ring-0 resize-none transition-colors placeholder:text-neutral-400 dark:placeholder:text-neutral-600 font-medium text-neutral-900 dark:text-neutral-100"
                        />
                    </div>

                    {status === 'error' && (
                        <p className="text-red-600 dark:text-red-400 font-medium">
                            Hmm ada yang salah. Yaudah maap.
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-8 py-3 rounded-full font-medium tracking-wide text-sm hover:bg-black dark:hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center"
                    >
                        {status === 'loading' ? 'Signing...' : 'Leave a Note'}
                    </button>
                </form>
            )}
        </div>
    )
}
