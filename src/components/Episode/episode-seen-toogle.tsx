"use client";

import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import {
    isEpisodeSeen,
    markEpisodeSeenRemote,
    setEpisodeSeenLocal, unmarkEpisodeSeenRemote,
} from "@/lib/utils/episode";

type Props = { slug: string };

export default function EpisodeSeenToggle({ slug }: Props) {
    const [seen, setSeen] = useState(false);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setSeen(isEpisodeSeen(slug));
    }, [slug]);

    function onToggle() {
        const next = !seen;

        // optimistic local
        setSeen(next);
        setEpisodeSeenLocal(slug, next);

        // si lo marca como visto -> persistimos en backend
        if (next) {
            startTransition(async () => {
                try {
                    await markEpisodeSeenRemote(slug);
                } catch {
                    // rollback si falla
                    setSeen(false);
                    setEpisodeSeenLocal(slug, false);
                }
            });
        }
        // si next === false
        if (!next) {
            startTransition(async () => {
                try {
                    await unmarkEpisodeSeenRemote(slug);
                    setEpisodeSeenLocal(slug, false)
                } catch {
                    // rollback si falla
                    setSeen(false);
                    setEpisodeSeenLocal(slug, true);
                }
            });
        }

    }

    return (
        <button
            type="button"
            onClick={onToggle}
            disabled={isPending}
            className={[
                "rounded-xl border p-2 transition",
                seen
                    ? "bg-foreground text-background"
                    : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
                isPending ? "opacity-70 cursor-not-allowed" : "",
            ].join(" ")}
            title={seen ? "Marcado como visto" : "Marcar como visto"}
        >
            {seen ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
    );
}
