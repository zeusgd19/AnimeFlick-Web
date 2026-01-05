"use client";

import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { isEpisodeSeen, toggleEpisodeSeen } from "@/lib/utils/episode";

type Props = {
    slug: string;
};

export default function EpisodeSeenToggle({ slug }: Props) {
    const [seen, setSeen] = useState(false);

    useEffect(() => {
        setSeen(isEpisodeSeen(slug));
    }, [slug]);

    function onToggle() {
        const newValue = toggleEpisodeSeen(slug);
        setSeen(newValue);
    }

    return (
        <button
            type="button"
            onClick={onToggle}
            className={`rounded-xl border p-2 transition
                ${seen
                ? "bg-foreground text-background"
                : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
            }
            `}
            title={seen ? "Marcar como no visto" : "Marcar como visto"}
        >
            {seen ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
    );
}
