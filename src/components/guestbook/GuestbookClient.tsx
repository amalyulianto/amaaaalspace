'use client'

import { useState } from 'react'
import { GuestbookEntry } from '@/lib/types'
import { useLanguage, LocalizedDate } from '@/components/layout/ThemeProvider'
import { PALESTINE_NAMES } from '@/lib/constants'

interface GuestbookClientProps {
    initialEntries: GuestbookEntry[]
}

export default function GuestbookClient({ initialEntries }: GuestbookClientProps) {
    const { t } = useLanguage()
    const [entries] = useState<GuestbookEntry[]>(initialEntries)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [authorName, setAuthorName] = useState('')
    const [message, setMessage] = useState('')
    const [honeypot, setHoneypot] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [successMessage, setSuccessMessage] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const handleRandomName = () => {
        const randomIndex = Math.floor(Math.random() * PALESTINE_NAMES.length)
        setAuthorName(PALESTINE_NAMES[randomIndex])
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (honeypot) {
            setSuccessMessage(true)
            setIsFormOpen(false)
            setAuthorName('')
            setMessage('')
            return
        }

        if (!authorName.trim() || !message.trim()) {
            setErrorMessage('Please fill in both name and message.')
            return
        }

        setSubmitting(true)
        setErrorMessage('')

        try {
            const res = await fetch('/api/guestbook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    author_name: authorName.trim(),
                    message: message.trim(),
                    website: honeypot,
                }),
            })

            if (res.ok) {
                setSuccessMessage(true)
                setIsFormOpen(false)
                setAuthorName('')
                setMessage('')
            } else {
                setErrorMessage('Failed to submit message. Please try again.')
            }
        } catch {
            setErrorMessage('Something went wrong. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h1 className="text-[32px] sm:text-[36px] font-bold tracking-tight text-foreground leading-tight m-0">
                        {t.guestbook.title}
                    </h1>

                    {!isFormOpen && (
                        <button
                            type="button"
                            onClick={() => setIsFormOpen(true)}
                            className="inline-flex items-center justify-center bg-foreground text-background hover:opacity-90 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-opacity self-start sm:self-auto"
                        >
                            {t.guestbook.openFormButton}
                        </button>
                    )}
                </div>

                <p className="text-sm sm:text-[15px] text-secondary leading-relaxed m-0">
                    {t.guestbook.subtitle}
                </p>
            </header>

            {/* Success Confirmation Banner */}
            {successMessage && (
                <div className="p-5 rounded-xl border border-border bg-surface/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground m-0">
                            {t.guestbook.thanksTitle}
                        </p>
                        <p className="text-xs sm:text-sm text-secondary m-0">
                            {t.guestbook.thanksSubtitle}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSuccessMessage(false)}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-border bg-background text-xs sm:text-sm font-medium text-foreground hover:border-foreground/30 transition-colors self-start sm:self-auto"
                    >
                        {t.guestbook.closeButton}
                    </button>
                </div>
            )}

            {/* Collapsible Editorial Composer */}
            {isFormOpen && (
                <div className="p-5 sm:p-6 rounded-xl border border-border bg-surface/40 space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                        <h2 className="text-base font-semibold text-foreground m-0">
                            {t.guestbook.formHeader}
                        </h2>
                        <button
                            type="button"
                            onClick={() => {
                                setIsFormOpen(false)
                                setErrorMessage('')
                            }}
                            className="text-xs text-muted hover:text-foreground transition-colors"
                        >
                            {t.guestbook.cancelButton}
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Honeypot field for spam prevention */}
                        <input
                            type="text"
                            name="website"
                            value={honeypot}
                            onChange={(e) => setHoneypot(e.target.value)}
                            style={{ display: 'none', visibility: 'hidden' }}
                            tabIndex={-1}
                            autoComplete="off"
                        />

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="author_name"
                                    className="text-xs font-medium text-secondary"
                                >
                                    {t.guestbook.nameLabel}
                                </label>
                                <button
                                    type="button"
                                    onClick={handleRandomName}
                                    className="text-xs text-muted hover:text-foreground underline underline-offset-4 transition-colors"
                                >
                                    {t.guestbook.randomName} 🎲
                                </button>
                            </div>
                            <input
                                id="author_name"
                                type="text"
                                value={authorName}
                                onChange={(e) => setAuthorName(e.target.value)}
                                placeholder={t.guestbook.namePlaceholder}
                                required
                                className="w-full px-3.5 py-2 border border-border bg-background rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor="message"
                                className="text-xs font-medium text-secondary"
                            >
                                {t.guestbook.messageLabel}
                            </label>
                            <textarea
                                id="message"
                                rows={3}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={t.guestbook.messagePlaceholder}
                                required
                                className="w-full px-3.5 py-2 border border-border bg-background rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground/50 transition-colors leading-relaxed"
                            />
                        </div>

                        {errorMessage && (
                            <p className="text-xs text-red-500 m-0">{errorMessage}</p>
                        )}

                        <div className="flex justify-end gap-2.5 pt-1">
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(false)}
                                className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-border bg-background text-xs sm:text-sm font-medium text-secondary hover:text-foreground transition-colors"
                            >
                                {t.guestbook.cancelButton}
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex items-center justify-center bg-foreground text-background hover:opacity-90 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium disabled:opacity-50 transition-opacity"
                            >
                                {submitting ? t.guestbook.submitting : t.guestbook.submitButton}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Editorial Guestbook Stream (Single Column) */}
            {entries.length > 0 ? (
                <div className="divide-y divide-border/60 border-t border-border/60">
                    {entries.map((entry) => (
                        <article
                            key={entry.id}
                            className="py-4 -mx-3 px-3 rounded-xl hover:bg-surface/60 transition-colors duration-200 space-y-1.5"
                        >
                            <p className="text-base sm:text-[17px] text-foreground leading-relaxed m-0 break-words">
                                {entry.message}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-muted tabular-nums">
                                <span>
                                    From:{' '}
                                    <span className="font-medium text-secondary">
                                        {entry.author_name}
                                    </span>
                                </span>
                                <span>•</span>
                                <time dateTime={entry.created_at}>
                                    <LocalizedDate date={entry.created_at} />
                                </time>
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted py-6">{t.guestbook.empty}</p>
            )}
        </div>
    )
}

export { GuestbookClient }
