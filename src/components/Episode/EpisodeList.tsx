'use client'

import React, { useState } from 'react'
import EpisodePill from './episode-pill'
import type { Episode } from '@/types/anime'
import { mergeSeenEpisodes, removeEpisodesFromLocal, getSeenEpisodes } from '@/lib/utils/episode'

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center rounded-full border bg-card/60 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur">
            {children}
        </span>
    );
}

interface Props {
    episodes: Episode[]
}

export default function EpisodeList({ episodes }: Props) {
    const [order, setOrder] = useState<'asc' | 'desc'>('asc')

    const sortedEpisodes = order === 'asc'
        ? [...episodes].sort((a, b) => a.number - b.number)
        : [...episodes].sort((a, b) => b.number - a.number)

    const toggleOrder = () => setOrder(order === 'asc' ? 'desc' : 'asc')

    const buttonText = order === 'asc' ? 'Orden ↑' : 'Orden ↓'

    const markAllAsWatched = async () => {
        const seen = new Set(getSeenEpisodes());
        const unwatchedSlugs = [...episodes]
            .sort((a, b) => a.number - b.number) // Asegurar orden cronológico
            .map(ep => ep.slug)
            .filter(slug => !seen.has(slug))
            .slice(0, 100);

        if (unwatchedSlugs.length === 0) return;

        try {
            const res = await fetch('/api/anime/watched/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ episodes: unwatchedSlugs })
            });
            if (res.ok) {
                mergeSeenEpisodes(unwatchedSlugs);
            } else {
                console.error('Error al marcar episodios');
            }
        } catch (e) {
            console.error('Error de red');
        }
    };

    const unmarkAllAsWatched = async () => {
        const seen = new Set(getSeenEpisodes());
        const watchedSlugs = [...episodes]
            .sort((a, b) => b.number - a.number) // Asegurar orden inverso para desmarcar los últimos
            .map(ep => ep.slug)
            .filter(slug => seen.has(slug))
            .slice(0, 100);

        if (watchedSlugs.length === 0) return;

        try {
            const res = await fetch('/api/anime/watched/batch', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ episodes: watchedSlugs })
            });
            if (res.ok) {
                removeEpisodesFromLocal(watchedSlugs);
            } else {
                console.error('Error al desmarcar episodios');
            }
        } catch (e) {
            console.error('Error de red');
        }
    };

    return (
        <section className="rounded-3xl border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold">Episodios</h2>
                    <p className="text-sm text-muted-foreground">
                        Scroll solo aquí (no en toda la página)
                    </p>
                </div>

                <div className="flex gap-2">
                    <Badge>{episodes.length} total</Badge>
                    <button
                        type="button"
                        onClick={toggleOrder}
                        className="rounded-2xl border bg-card px-3 py-2 text-sm font-medium hover:bg-accent transition-colors cursor-pointer"
                    >
                        {buttonText}
                    </button>
                    <button
                        type="button"
                        onClick={markAllAsWatched}
                        className="rounded-2xl border bg-card px-3 py-2 text-sm font-medium hover:bg-accent transition-colors cursor-pointer"
                    >
                        Marcar 100
                    </button>
                    <button
                        type="button"
                        onClick={unmarkAllAsWatched}
                        className="rounded-2xl border bg-card px-3 py-2 text-sm font-medium hover:bg-accent transition-colors cursor-pointer"
                    >
                        Desmarcar 100
                    </button>
                </div>
            </div>

            {/* Scroll container */}
            <div className="mt-4 max-h-[520px] overflow-y-auto pr-2 overscroll-contain">
                <div className="grid gap-2">
                    {sortedEpisodes.map((ep) => (
                        <EpisodePill key={ep.number} ep={ep} />
                    ))}
                </div>
            </div>
        </section>
    )
}
