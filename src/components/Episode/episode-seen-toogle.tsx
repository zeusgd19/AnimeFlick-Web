"use client";

import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import {
    isEpisodeSeen,
    markEpisodeSeenRemote,
    setEpisodeSeenLocal,
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
    const controlled = typeof seen === "boolean";
    const [innerSeen, setInnerSeen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const currentSeen = controlled ? (seen as boolean) : innerSeen;

    // init/sync desde localStorage al cambiar slug
    useEffect(() => {
        const initial = isEpisodeSeen(slug);
        if (!controlled) setInnerSeen(initial);
        onSeenChangeAction?.(initial);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug]);

    function setSeenBoth(next: boolean) {
        if (!controlled) setInnerSeen(next);
        onSeenChangeAction?.(next);
    }

    function onToggle() {
        const next = !currentSeen;

        // optimistic local
        setSeenBoth(next);
        setEpisodeSeenLocal(slug, next);

        startTransition(async () => {
            try {
                if (next) await markEpisodeSeenRemote(slug);
                else await unmarkEpisodeSeenRemote(slug);
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
            disabled={isPending}
            className={[
                "rounded-xl border p-2 transition",
                currentSeen
                    ? "bg-foreground text-background"
                    : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
                isPending ? "opacity-70 cursor-not-allowed" : "",
            ].join(" ")}
            title={currentSeen ? "Marcado como visto" : "Marcar como visto"}
        >
            {currentSeen ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
    );
}
