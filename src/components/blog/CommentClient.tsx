"use client";

import { useState } from "react";
import { Comment } from "@/lib/types";
import { PALESTINE_NAMES } from "@/lib/constants";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Bullet } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/components/layout/ThemeProvider";

export function CommentClient({ postId, initialComments }: { postId: string; initialComments: Comment[] }) {
    const { lang, t } = useLanguage();
    const [comments] = useState<Comment[]>(initialComments);
    const [commentForm, setCommentForm] = useState({ name: "", message: "", honeypot: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const generateRandomName = () => {
        const randomIndex = Math.floor(Math.random() * PALESTINE_NAMES.length);
        setCommentForm({ ...commentForm, name: PALESTINE_NAMES[randomIndex] });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (commentForm.honeypot) {
            return;
        }

        setIsSubmitting(true);

        try {
            const body = {
                post_id: postId,
                author_name: commentForm.name,
                content: commentForm.message,
                website: commentForm.honeypot,
            };

            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                setSubmitSuccess(true);
                setIsSubmitting(false);
                setCommentForm({ name: "", message: "", honeypot: "" });
            } else {
                setIsSubmitting(false);
            }
        } catch {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="comments" className="space-y-8">
            <div className="space-y-4">
                <SectionHeading>
                    {t.blog.commentsTitle} ({comments.length}) 💬
                </SectionHeading>

                {comments.length > 0 ? (
                    <div className="space-y-5 pt-1">
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex items-start gap-3">
                                <Bullet className="mt-[5px]" />
                                <div className="min-w-0 space-y-1">
                                    <p className="text-sm sm:text-[15px] text-foreground leading-relaxed whitespace-pre-wrap m-0">
                                        {comment.content}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-xs text-muted tabular-nums">
                                        <span className="font-medium text-secondary">
                                            {comment.author_name}
                                        </span>
                                        <span>•</span>
                                        <time dateTime={comment.created_at}>{formatDate(comment.created_at, lang)}</time>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs sm:text-sm text-muted">
                        {t.blog.commentsEmpty}
                    </p>
                )}
            </div>

            {/* Comment Form */}
            <div className="space-y-4 pt-2">
                <SectionHeading>
                    {t.blog.replyTitle}
                </SectionHeading>

                {submitSuccess ? (
                    <Card className="space-y-1 text-sm">
                        <p className="font-semibold text-foreground m-0">{t.blog.thanksTitle}</p>
                        <p className="text-xs text-secondary m-0">
                            {t.blog.thanksSubtitle}
                        </p>
                        <button
                            type="button"
                            onClick={() => setSubmitSuccess(false)}
                            className="pt-2 text-xs font-medium text-foreground underline underline-offset-4"
                        >
                            {t.blog.commentAgain}
                        </button>
                    </Card>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            name="website"
                            value={commentForm.honeypot}
                            onChange={(e) => setCommentForm({ ...commentForm, honeypot: e.target.value })}
                            style={{ display: 'none', visibility: 'hidden' }}
                            tabIndex={-1}
                            autoComplete="off"
                        />

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label htmlFor="name" className="text-xs font-medium text-secondary">
                                    {t.blog.nameLabel}
                                </label>
                                <button
                                    type="button"
                                    onClick={generateRandomName}
                                    className="text-xs text-muted hover:text-foreground underline underline-offset-4 transition-colors"
                                >
                                    {t.blog.randomName}
                                </button>
                            </div>
                            <input
                                type="text"
                                id="name"
                                required
                                value={commentForm.name}
                                onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
                                className="w-full px-3 py-2 text-sm bg-surface/60 border border-border rounded focus:border-foreground outline-none transition-colors placeholder:text-muted text-foreground"
                                placeholder={t.blog.namePlaceholder}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="message" className="block text-xs font-medium text-secondary">
                                {t.blog.messageLabel}
                            </label>
                            <textarea
                                id="message"
                                required
                                rows={3}
                                value={commentForm.message}
                                onChange={(e) => setCommentForm({ ...commentForm, message: e.target.value })}
                                className="w-full px-3 py-2 text-sm bg-surface/60 border border-border rounded focus:border-foreground outline-none transition-colors resize-y placeholder:text-muted text-foreground"
                                placeholder={t.blog.messagePlaceholder}
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-1.5 bg-foreground text-background text-xs font-medium rounded hover:opacity-85 transition-opacity disabled:opacity-50"
                            >
                                {isSubmitting ? t.blog.submitting : t.blog.submitButton}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </section>
    );
}
