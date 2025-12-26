export async function fetchLatestEpisodesFromExternal() {
    const base = process.env.EXTERNAL_API_BASE!;
    const res = await fetch(`${base}/api/list/latest-episodes`, {
        // cache del fetch en Next (ajusta a tu gusto)
        next: { revalidate: 300 },
    });

    if (!res.ok) throw new Error("External API error");
    return res.json();
}

export async function fetchAnimesOnAir() {
    const base = process.env.EXTERNAL_API_BASE!;
    const res = await fetch(`${base}/api/list/animes-on-air`, {
        next: { revalidate: 300 },
    });

    if (!res.ok) throw new Error("External API error");

    return res.json();
}

export async function fetchAnimeBySlug(slug: string) {
    const base = process.env.EXTERNAL_API_BASE!;

    const res = await fetch(`${base}/api/anime/${encodeURIComponent(slug)}`, {
        next: { revalidate: 300 },
    })

    if (!res.ok) throw new Error("External API error");
    return res.json();
}