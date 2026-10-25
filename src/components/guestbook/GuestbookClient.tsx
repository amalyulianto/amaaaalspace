"use client";

import { useState } from "react";
import { PALESTINE_NAMES } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import { formatDateShort } from "@/lib/utils";
import { useLanguage } from "@/components/layout/ThemeProvider";

export interface GuestbookMessage {
    id: string;
    name: string;
    message: string;
    date: string;
}

export function GuestbookClient({ initialMessages }: { initialMessages: GuestbookMessage[] }) {
    const { lang, t } = useLanguage();
    const [messages] = useState<GuestbookMessage[]>(initialMessages);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [form, setForm] = useState({ name: "", message: "", honeypot: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const generateRandomName = () => {
        const randomIndex = Math.floor(Math.random() * PALESTINE_NAMES.length);
        setForm({ ...form, name: PALESTINE_NAMES[randomIndex] });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.honeypot) return;

        setIsSubmitting(true);

        try {
            const body = {
                author_name: form.name,
                message: form.message,
                website: form.honeypot,
            };

            const res = await fetch('/api/guestbook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                setSubmitSuccess(true);
                setIsSubmitting(false);
                setForm({ name: "", message: "", honeypot: "" });
            } else {
                setIsSubmitting(false);
            }
        } catch {
            setIsSubmitting(false);
        }
    };

    const handleCloseSuccess = () => {
        setSubmitSuccess(false);
        setIsFormOpen(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="space-y-5">
                <h1 className="text-[32px] sm:text-[36px] font-bold tracking-tight text-foreground leading-tight m-0">
                    {t.guestbook.title}
                </h1>

                <p className="text-sm sm:text-[15px] text-secondary leading-relaxed m-0">
                    {t.guestbook.subtitle}
                </p>

                {!isFormOpen && (
                    <div className="pt-1">
                        <button
                            type="button"
                            onClick={() => {
                                setSubmitSuccess(false);
                                setIsFormOpen(true);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-xs sm:text-[13px] font-medium rounded-md hover:opacity-85 transition-opacity"
                        >
                            <span>{t.guestbook.openFormButton}</span>
                        </button>
                    </div>
                )}
            </header>

            {/* Expandable Form / Success Section */}
            {isFormOpen && (
                <Card className="p-5 animate-in fade-in duration-300">
                    {submitSuccess ? (
                        <div className="space-y-3 text-sm text-foreground">
                            <div className="space-y-1">
                                <p className="font-semibold text-foreground m-0">
                                    {t.guestbook.thanksTitle}
                                </p>
                                <p className="text-xs sm:text-[13px] text-secondary leading-relaxed m-0">
                                    {t.guestbook.thanksSubtitle}
                                </p>
                            </div>
                            <div className="pt-1">
                                <button
                                    type="button"
                                    onClick={handleCloseSuccess}
                                    className="px-4 py-1.5 bg-foreground text-background text-xs font-medium rounded hover:opacity-85 transition-opacity"
                                >
                                    {t.guestbook.closeButton}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-border">
                                <span className="text-xs font-semibold text-foreground">
                                    {t.guestbook.formHeader}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="text-xs text-muted hover:text-foreground transition-colors"
                                >
                                    {t.guestbook.cancelButton}
                                </button>
                            </div>

                            <input
                                type="text"
                                name="website"
                                value={form.honeypot}
                                onChange={(e) => setForm({ ...form, honeypot: e.target.value })}
                                style={{ display: 'none', visibility: 'hidden' }}
                                tabIndex={-1}
                                autoComplete="off"
                            />

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="guestbook-name" className="text-xs font-medium text-secondary">
                                        {t.guestbook.nameLabel}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={generateRandomName}
                                        className="text-xs text-muted hover:text-foreground underline underline-offset-4 transition-colors"
                                    >
                                        {t.guestbook.randomName}
                                    </button>
                                </div>
                                <input
                                    id="guestbook-name"
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded focus:border-foreground outline-none transition-colors placeholder:text-muted text-foreground"
                                    placeholder={t.guestbook.namePlaceholder}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="guestbook-message" className="block text-xs font-medium text-secondary">
                                    {t.guestbook.messageLabel}
                                </label>
                                <textarea
                                    id="guestbook-message"
                                    required
                                    rows={3}
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded focus:border-foreground outline-none transition-colors resize-none placeholder:text-muted text-foreground"
                                    placeholder={t.guestbook.messagePlaceholder}
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !form.name || !form.message}
                                    className="px-4 py-1.5 bg-foreground text-background text-xs font-medium rounded hover:opacity-85 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? t.guestbook.submitting : t.guestbook.submitButton}
                                </button>
                            </div>
                        </form>
                    )}
                </Card>
            )}

            {/* Guestbook Note Cards Grid */}
            <div className="pt-1">
                {messages.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {messages.map((msg) => (
                            <Card
                                key={msg.id}
                                className="flex flex-col justify-between space-y-4"
                            >
                                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words m-0">
                                    &ldquo;{msg.message}&rdquo;
                                </p>

                                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/70 text-xs text-muted">
                                    <span className="font-semibold text-secondary truncate">
                                        — {msg.name}
                                    </span>
                                    <time dateTime={msg.date} className="shrink-0 tabular-nums">
                                        {formatDateShort(msg.date, lang)}
                                    </time>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted py-4">
                        {t.guestbook.empty}
                    </p>
                )}
            </div>
        </div>
    );
}
