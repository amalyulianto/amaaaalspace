"use client";

import { useState } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { PenLine, X } from "lucide-react";

export interface GuestbookMessage {
    id: string;
    name: string;
    message: string;
    date: string;
}

export function GuestbookClient({ initialMessages }: { initialMessages: GuestbookMessage[] }) {
    const [messages] = useState<GuestbookMessage[]>(initialMessages);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [form, setForm] = useState({ name: "", message: "", honeypot: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.honeypot) return; // Keep honey pot short-circuit client side

        setIsSubmitting(true);

        try {
            const body = {
                author_name: form.name,
                message: form.message,
                website: form.honeypot,
            }

            const res = await fetch('/api/guestbook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })

            if (res.ok) {
                setSubmitSuccess(true);
                setIsSubmitting(false);
                setForm({ name: "", message: "", honeypot: "" });

                // Auto close success message after a few seconds
                setTimeout(() => {
                    setIsFormOpen(false);
                    setSubmitSuccess(false);
                }, 3000);
            } else {
                setIsSubmitting(false);
            }
        } catch {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pt-4 md:pt-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-100 pb-8">
                <div className="space-y-4">
                    <h1 className="text-3xl font-bold tracking-tight">Guestbook</h1>
                    <p className="text-lg text-neutral-600">
                        Leave a trace. Share a thought, a quote, or just say hi.
                    </p>
                </div>
                {!isFormOpen && (
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-full hover:bg-neutral-800 transition-colors shadow-sm whitespace-nowrap self-start md:self-auto"
                    >
                        <PenLine className="w-4 h-4" /> Leave a Note
                    </button>
                )}
            </header>

            {/* Expandable Form Section */}
            <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isFormOpen ? "max-h-[500px] opacity-100 mb-12" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="bg-neutral-50 p-6 md:p-8 rounded-2xl border border-neutral-100 relative">
                    <button
                        onClick={() => setIsFormOpen(false)}
                        className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-900 bg-white rounded-full border border-neutral-200 transition-colors"
                        aria-label="Close form"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <h2 className="text-xl font-bold mb-6 pr-8">Sign the Guestbook</h2>

                    {submitSuccess ? (
                        <div className="bg-green-50 text-green-800 p-5 rounded-xl border border-green-200 animate-in zoom-in-95">
                            <p className="font-medium text-lg">Thanks for your note!</p>
                            <p className="text-sm mt-1">Your message is securely stored and awaiting brief review before it appears.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="hidden" aria-hidden="true">
                                <input
                                    type="text"
                                    name="honeypot"
                                    value={form.honeypot}
                                    onChange={(e) => setForm({ ...form, honeypot: e.target.value })}
                                    tabIndex={-1}
                                />
                            </div>

                            <div>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-neutral-200 focus:ring-0 focus:border-neutral-900 text-lg outline-none transition-colors placeholder:text-neutral-400"
                                    placeholder="What's your name?"
                                />
                            </div>

                            <div>
                                <textarea
                                    required
                                    rows={3}
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-neutral-200 focus:ring-0 focus:border-neutral-900 text-lg outline-none transition-colors resize-none placeholder:text-neutral-400"
                                    placeholder="Write your message here..."
                                />
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !form.name || !form.message}
                                    className="px-6 py-2.5 bg-neutral-900 text-white font-medium rounded-full hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                                >
                                    {isSubmitting ? "Signing..." : "Sign"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Masonry Grid for Messages */}
            <div className="w-full">
                {messages.length > 0 ? (
                    <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 600: 2 }}>
                        <Masonry gutter="1.5rem">
                            {messages.map((msg, index) => {
                                const rotations = ["-rotate-1", "rotate-0", "rotate-1", "-rotate-2", "rotate-2"];
                                const randomRotation = rotations[index % rotations.length];

                                return (
                                    <div
                                        key={msg.id}
                                        className={`bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300 ${randomRotation} hover:rotate-0 hover:-translate-y-1 w-full`}
                                    >
                                        <p className="text-neutral-800 text-lg leading-relaxed mb-6 font-medium">
                                            "{msg.message}"
                                        </p>
                                        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-neutral-100">
                                            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-bold text-sm p-0 m-0 shrink-0">
                                                {msg.name ? msg.name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <div className="flex flex-col m-0 p-0 leading-tight min-w-0">
                                                <h3 className="font-semibold text-sm text-neutral-900 m-0 p-0 truncate">{msg.name}</h3>
                                                <span className="text-xs font-medium text-neutral-400 m-0 p-0 mt-0.5">
                                                    {new Date(msg.date).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric"
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </Masonry>
                    </ResponsiveMasonry>
                ) : (
                    <div className="text-center py-20 border-2 border-dashed border-neutral-200 rounded-2xl w-full">
                        <p className="text-neutral-500">The guestbook is empty. Be the first to leave a trace!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
