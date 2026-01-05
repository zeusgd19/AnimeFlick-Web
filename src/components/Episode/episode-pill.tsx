"use client";

import Link from "next/link";
import type { Episode } from "@/types/anime";
import EpisodeSeenToggle from "./episode-seen-toogle";

type Props = {
    ep: Episode;
};

export default function EpisodePill({ ep }: Props) {
    return (
        <div className="group flex items-center justify-between gap-3 rounded-2xl border bg-card p-3 hover:bg-accent transition">
            <div className="min-w-0">
                <p className="text-sm font-semibold">
                    Episodio {ep.number}
                </p>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {ep.slug}
                </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                {/* 👁️ visto / no visto */}
                <EpisodeSeenToggle slug={ep.slug} />

                {/* ▶️ Ver */}
                <Link
                    href={`/watch/${ep.slug}`}
                    className="rounded-xl bg-foreground px-3 py-2 text-xs font-medium text-background hover:opacity-90"
                >
                    Ver
                </Link>

                {/* 🌐 Fuente */}
                <a
                    href={ep.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border bg-card px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                    title="Abrir fuente"
                >
                    Fuente ↗
                </a>
            </div>
        </div>
    );
}
