"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, useTransition } from "react";
import { useAuth } from "@/context/auth-context";
import {
    markEpisodeSeenRemote,
    unmarkEpisodeSeenRemote,
} from "@/lib/utils/episode";

type Props = {
    slug: string;

    // opcional: si lo pasas, el padre recibe cambios y puede pintar texto
    onSeenChangeAction?: (seen: boolean) => void;

    // opcional: modo controlado
    seen?: boolean;
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

    function onToggle() {
        const next = !currentSeen;

        // optimistic UI
        setSeenBoth(next);
        if (!user) return;

        startTransition(async () => {
            try {
                const res = next
                    ? await markEpisodeSeenRemote(slug)
                    : await unmarkEpisodeSeenRemote(slug);

                if (res.status === 401) return;
                if (!res.ok) throw new Error("Failed to mark watched");
            } catch {
                // rollback
                setSeenBoth(!next);
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
