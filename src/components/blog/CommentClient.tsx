"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Comment } from "@/lib/types";

export function CommentClient({ postId, initialComments }: { postId: string, initialComments: Comment[] }) {
    const [comments] = useState<Comment[]>(initialComments);
    const [commentForm, setCommentForm] = useState({ name: "", message: "", honeypot: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Spam protection (honeypot)
        if (commentForm.honeypot) {
            console.log("Spam detected");
            return;
        }

        setIsSubmitting(true);

        try {
            const body = {
                post_id: postId,
                author_name: commentForm.name,
                content: commentForm.message,
                website: commentForm.honeypot,
            }

            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })

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
            <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-neutral-500" />
                <h2 className="text-2xl font-bold">Comments ({comments.length})</h2>
            </div>

            <div className="space-y-6">
                {comments.map((comment) => (
                    <div key={comment.id} className="bg-neutral-50 p-6 rounded-lg border border-neutral-100 space-y-3">
                        <div className="flex justify-between items-baseline">
                            <h3 className="font-semibold text-neutral-900">{comment.author_name}</h3>
                            <time className="text-xs text-neutral-500">
                                {new Date(comment.created_at).toLocaleDateString()}
                            </time>
                        </div>
                        <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                    </div>
                ))}

                {comments.length === 0 && (
                    <p className="text-neutral-500 italic">No comments yet. Be the first to share your thoughts!</p>
                )}
            </div>

            {/* Comment Form */}
            <div className="mt-12 bg-white p-6 md:p-8 rounded-xl border border-neutral-200 shadow-sm">
                <h3 className="text-lg font-bold mb-6">Leave a Reply</h3>

                {submitSuccess ? (
                    <div className="bg-green-50 text-green-800 p-4 rounded-lg border border-green-200">
                        <p className="font-medium">Thanks for your comment!</p>
                        <p className="text-sm mt-1">It has been submitted and is awaiting approval before it appears here.</p>
                        <button
                            onClick={() => setSubmitSuccess(false)}
                            className="mt-4 text-sm font-medium underline"
                        >
                            Write another comment
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Honeypot field (hidden from users) */}
                        <div className="hidden" aria-hidden="true">
                            <label htmlFor="honeypot">Leave this field empty</label>
                            <input
                                type="text"
                                id="honeypot"
                                name="honeypot"
                                value={commentForm.honeypot}
                                onChange={(e) => setCommentForm({ ...commentForm, honeypot: e.target.value })}
                                tabIndex={-1}
                                autoComplete="off"
                            />
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                            <input
                                type="text"
                                id="name"
                                required
                                value={commentForm.name}
                                onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 outline-none transition-shadow"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-1">Message</label>
                            <textarea
                                id="message"
                                required
                                rows={4}
                                value={commentForm.message}
                                onChange={(e) => setCommentForm({ ...commentForm, message: e.target.value })}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 outline-none transition-shadow resize-y"
                                placeholder="What are your thoughts?"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto px-6 py-2.5 bg-neutral-900 text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-70 flex items-center justify-center min-w-[120px]"
                        >
                            {isSubmitting ? "Submitting..." : "Post Comment"}
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
}
