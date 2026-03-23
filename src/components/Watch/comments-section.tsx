"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { MessageSquare, Trash2, Loader2, Send } from "lucide-react";
import type { Comment } from "@/types/comment";

function getInitials(name?: string | null) {
    if (!name) return "?";
    return name.slice(0, 2).toUpperCase();
}

function timeAgo(dateString: string) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "hace un momento";
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `hace ${diffInMinutes} m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `hace ${diffInHours} h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `hace ${diffInDays} d`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `hace ${diffInMonths} mes${diffInMonths > 1 ? 'es' : ''}`;
    
    const diffInYears = Math.floor(diffInDays / 365);
    return `hace ${diffInYears} año${diffInYears > 1 ? 's' : ''}`;
}

export default function CommentsSection({ episodeSlug }: { episodeSlug: string }) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState<number | null>(null);
    const [newComment, setNewComment] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        async function fetchComments() {
            setLoading(true);
            try {
                const res = await fetch(`/api/comments/${episodeSlug}`);
                const data = await res.json();
                if (mounted) {
                    setComments(data?.comments || []);
                }
            } catch (err) {
                if (mounted) setError("Error al cargar los comentarios");
            } finally {
                if (mounted) setLoading(false);
            }
        }
        fetchComments();
        return () => { mounted = false; };
    }, [episodeSlug]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!newComment.trim() || !user) return;
        
        const content = newComment.trim();
        setSubmitting(true);
        setError(null);
        
        try {
            const res = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    episode_slug: episodeSlug,
                    content,
                }),
            });
            
            if (!res.ok) throw new Error("Failed to post comment");
            
            const data = await res.json();
            
            if (data.comment) {
                // Server returned the real comment with DB id
                setComments(prev => [data.comment, ...prev]);
            } else {
                // Show optimistic comment instantly
                const optimistic: Comment = {
                    id: -Date.now(),
                    user_id: user.id,
                    display_name: user.display_name || user.email || "Tú",
                    episode_slug: episodeSlug,
                    content,
                    created_at: new Date().toISOString(),
                };
                setComments(prev => [optimistic, ...prev]);
                
                // Refetch from server to get the real id
                fetch(`/api/comments/${episodeSlug}`)
                    .then(r => r.json())
                    .then(d => { if (d?.comments) setComments(d.comments); })
                    .catch(() => {});
            }
            
            setNewComment("");
        } catch (err) {
            setError("Hubo un error al publicar el comentario.");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(commentId: number) {
        setDeletingId(commentId);
        setConfirmingDeleteId(null);
        try {
            const res = await fetch(`/api/comments/delete/${commentId}`, {
                method: "DELETE",
            });
            
            if (res.ok) {
                setComments(prev => prev.filter(c => c.id !== commentId));
            } else {
                setError("Error al eliminar el comentario.");
            }
        } catch (err) {
            setError("Error al eliminar el comentario.");
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <section className="rounded-3xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-foreground" />
                <h3 className="text-sm font-semibold">Comentarios</h3>
                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-muted-foreground ml-auto">
                    {comments.length}
                </span>
            </div>

            {error && (
                <div className="mb-4 rounded-2xl bg-destructive/15 p-4 text-sm text-destructive border border-destructive/20">
                    {error}
                </div>
            )}

            {/* Comment Form */}
            <div className="mb-6">
                {user ? (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Añade un comentario..."
                            className="w-full rounded-2xl border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 min-h-[80px] resize-y"
                            disabled={submitting}
                        />
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting || !newComment.trim()}
                                className="flex items-center gap-2 rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                            >
                                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                {submitting ? "Publicando..." : "Comentar"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="rounded-2xl border bg-background p-4 text-center">
                        <p className="text-xs text-muted-foreground mb-3">Únete a la conversación</p>
                        <Link 
                            href="/login" 
                            className="inline-flex items-center justify-center rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition-opacity"
                        >
                            Iniciar Sesión
                        </Link>
                    </div>
                )}
            </div>

            {/* Comments List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.id} className={`group relative rounded-2xl p-3 transition-colors ${confirmingDeleteId === comment.id ? 'bg-destructive/5 border border-destructive/20' : 'hover:bg-accent/50'}`}>
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0 border border-border text-[10px] font-medium">
                                        {getInitials(comment.display_name)}
                                    </div>
                                    <span className="font-semibold text-xs truncate">{comment.display_name || "Usuario"}</span>
                                    <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(comment.created_at)}</span>
                                </div>
                                {user && user.id === comment.user_id && confirmingDeleteId !== comment.id && (
                                    <button
                                        onClick={() => setConfirmingDeleteId(comment.id)}
                                        disabled={deletingId === comment.id}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full focus:opacity-100 disabled:opacity-50"
                                        title="Borrar comentario"
                                    >
                                        {deletingId === comment.id ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                )}
                            </div>
                            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed pl-8">{comment.content}</p>
                            {confirmingDeleteId === comment.id && (
                                <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-destructive/10">
                                    <span className="text-xs text-muted-foreground mr-auto">¿Borrar?</span>
                                    <button
                                        onClick={() => setConfirmingDeleteId(null)}
                                        className="rounded-xl border px-3 py-1 text-xs font-medium hover:bg-accent transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(comment.id)}
                                        disabled={deletingId === comment.id}
                                        className="flex items-center gap-1 rounded-xl bg-destructive/90 px-3 py-1 text-xs font-medium text-white hover:bg-destructive transition-colors disabled:opacity-50"
                                    >
                                        {deletingId === comment.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                        Borrar
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-6">
                        <p className="text-xs text-muted-foreground">Aún no hay comentarios. ¡Sé el primero!</p>
                    </div>
                )}
            </div>
        </section>
    );
}
