import {RealAnimeType} from "@/types/anime";

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 8000);

export async function fetchLatestEpisodesFromExternal() {
    const base = process.env.EXTERNAL_API_BASE!;
    const res = await fetch(`${base}/api/list/latest-episodes`, {
        // cache del fetch en Next (ajusta a tu gusto)
        next: { revalidate: 300 },
        signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error("External API error");
    return res.json();
}

export async function fetchAnimesOnAir() {
    const base = process.env.EXTERNAL_API_BASE!;
    const res = await fetch(`${base}/api/list/animes-on-air`, {
        next: { revalidate: 300 },
        signal: controller.signal,
    });

    clearTimeout(timeout);
    if (!res.ok) throw new Error("External API error");

    return res.json();
}

export async function fetchAnimeBySlug(slug: string) {
    const base = process.env.EXTERNAL_API_BASE!;

    const res = await fetch(`${base}/api/anime/${encodeURIComponent(slug)}`, {
        next: { revalidate: 300 },
        signal: controller.signal,
    })
    clearTimeout(timeout);

    if (!res.ok) throw new Error("External API error");
    return res.json();
}

export async function fetchAnimesByFilter(type: RealAnimeType, page = 1){
    const base = process.env.EXTERNAL_API_BASE!;

    const res = await fetch(`${base}/api/search/by-filter?order=title&page=${page}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ types: [type] }),
        next: { revalidate: 300 },
        signal: controller.signal,
    });

    clearTimeout(timeout);
    console.log(res)

    if (!res.ok) throw new Error("External API error");
    return res.json();
}

export async function fetchSearchAnime(query: string, page = 1) {
    const base = process.env.EXTERNAL_API_BASE!;

    const res = await fetch(`${base}/api/search?query=${query}&page=${page}`, {
        next: { revalidate: 300 },
        signal: controller.signal,
    })

    clearTimeout(timeout);

    if (!res.ok) throw new Error("External API error");

    return res.json();
}