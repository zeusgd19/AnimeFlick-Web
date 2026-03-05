"use client";

import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@/context/auth-context";
import {
    isEpisodeSeen,
    setEpisodeSeenLocal,
    markEpisodeSeenRemote,
    unmarkEpisodeSeenRemote,
} from "@/lib/utils/episode";

type Props = {
    slug: string;
    onSeenChangeAction?: (seen: boolean) => void;
    seen?: boolean; // modo controlado opcional
};

export default function EpisodeSeenToggle({ slug, onSeenChangeAction, seen }: Props) {
    const { user } = useAuth();
    const controlled = typeof seen === "boolean";
    const [innerSeen, setInnerSeen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const currentSeen = controlled ? (seen as boolean) : innerSeen;

    function setSeenBoth(next: boolean) {
        if (!controlled) setInnerSeen(next);
        onSeenChangeAction?.(next);
    }

    // ✅ inicializa desde localStorage
    useEffect(() => {
        let alive = true;

        (async () => {
            // si no hay user, aun así puedes pintar lo que haya en local
            if (!controlled) setInnerSeen(isEpisodeSeen(slug));

            // No sync global, se hace per anime page
        })();

        // Listen for watched updates
        function handleWatchedUpdate() {
            if (alive && !controlled) setInnerSeen(isEpisodeSeen(slug));
        }
        window.addEventListener('watchedUpdated', handleWatchedUpdate);

        return () => {
            alive = false;
            window.removeEventListener('watchedUpdated', handleWatchedUpdate);
        };
    }, [slug, user, controlled]);

    function onToggle() {
        const next = !currentSeen;

        // ✅ optimistic UI + optimistic local
        setSeenBoth(next);
        setEpisodeSeenLocal(slug, next);

        if (!user) return;

        startTransition(async () => {
            try {
                const res = next
                    ? await markEpisodeSeenRemote(slug)
                    : await unmarkEpisodeSeenRemote(slug);

                if (res.status === 401) {
                    // rollback si no autorizado
                    setSeenBoth(!next);
                    setEpisodeSeenLocal(slug, !next);
                    return;
                }

                if (!res.ok) throw new Error("Failed to toggle watched");

                // opcional: consumir json si lo necesitas
                // await res.json();
            } catch {
                // rollback
                setSeenBoth(!next);
                setEpisodeSeenLocal(slug, !next);
            }
        });
    }

    return (
        <button
            type="button"
            onClick={onToggle}
            disabled={isPending || !user}
            className={[
                "rounded-xl border p-2 transition",
                currentSeen
                    ? "bg-foreground text-background"
                    : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
                isPending || !user ? "opacity-70 cursor-not-allowed" : "",
            ].join(" ")}
            title={
                !user
                    ? "Inicia sesión para marcar como visto"
                    : currentSeen
                        ? "Marcado como visto"
                        : "Marcar como visto"
            }
        >
            {currentSeen ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
    );
}