"use client";

import { useState } from "react";
import EpisodeSeenToggle from "@/components/Episode/episode-seen-toogle";

export function EpisodeSeenRow({ episodeSlug }: { episodeSlug: string }) {
    const [seen, setSeen] = useState(false);

    return (
        <div className="flex justify-center items-center gap-2">
            <EpisodeSeenToggle slug={episodeSlug} onSeenChangeAction={setSeen} />
            <span>{seen ? "Visto" : "Marcar como visto"}</span>
        </div>
    );
}
