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

const KEY = "seenEpisodes";

export function getSeenEpisodes(): string[] {
    if (typeof window === "undefined") return [];
    try {
        return JSON.parse(localStorage.getItem(KEY) ?? "[]");
    } catch {
        return [];
    }
}

export function isEpisodeSeen(slug: string): boolean {
    return getSeenEpisodes().includes(slug);
}

export function toggleEpisodeSeen(slug: string): boolean {
    const current = getSeenEpisodes();

    const updated = current.includes(slug)
        ? current.filter(s => s !== slug)
        : [...current, slug];

    localStorage.setItem(KEY, JSON.stringify(updated));
    return updated.includes(slug);
}
