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