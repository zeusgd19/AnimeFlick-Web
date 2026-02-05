export function parseEpisodeSlug(episodeSlug: string): { animeSlug: string; number: number } {
    // Caso típico: "one-piece-1060" => animeSlug="one-piece", number=1060
    const m = episodeSlug.match(/^(.*?)-(\d+)$/);
    if (!m) throw new Error(`Invalid episode slug format: ${episodeSlug}`);

    const animeSlug = m[1];
    const number = Number(m[2]);

    if (!animeSlug || !Number.isFinite(number) || number < 1) {
        throw new Error(`Invalid episode slug values: ${episodeSlug}`);
    }

    return { animeSlug, number };
}

// ------- Remote mark seen -------
export async function markEpisodeSeenRemote(episodeSlug: string) {
    // Tu backend pide WatchedEpisodeBody: ajusta campos según necesites

    const body = {
        episode_slug: episodeSlug,
    };

    const res = await fetch("/api/watched", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    return res;
}

export async function unmarkEpisodeSeenRemote(episodeSlug: string) {
    // Tu backend pide WatchedEpisodeBody: ajusta campos según necesites

    const body = {
        episode_slug: episodeSlug,
    };

    const res = await fetch("/api/watched/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    return res;
}


