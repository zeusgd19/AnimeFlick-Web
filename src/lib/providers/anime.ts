// src/lib/providers/anime.ts
import "server-only";
import { RealAnimeType } from "@/types/anime";

/**
 * Fetch con timeout POR REQUEST (no global).
 */
function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, ms = 8000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ms);

    return fetch(input, {
        ...init,
        signal: controller.signal,
    }).finally(() => clearTimeout(timeout));
}

type FetchJsonOptions = RequestInit & { timeoutMs?: number };

async function strictJsonFetch<T>(url: string, opts: FetchJsonOptions = {}): Promise<T> {
    const { timeoutMs = 8000, ...init } = opts;
    const res = await fetchWithTimeout(url, init, timeoutMs);

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} :: ${url} :: ${text.slice(0, 160)}`);
    }

    return (await res.json()) as T;
}

async function safeJsonFetch<T>(url: string, opts: FetchJsonOptions = {}): Promise<T | null> {
    try {
        return await strictJsonFetch<T>(url, opts);
    } catch (e) {
        console.warn("[safeJsonFetch] failed:", url, e);
        return null;
    }
}

/**
 * Providers EXTERNAL API
 * - En Home/Search: puedes usar safe si no quieres que reviente por un fallo puntual
 * - En páginas críticas (detalle anime): usa strict
 */
export async function fetchLatestEpisodesFromExternal() {
    const base = process.env.EXTERNAL_API_BASE!;
    const url = `${base}/api/list/latest-episodes`;

    // Home suele ser tolerante: si falla, mejor devolver null y mostrar placeholder
    return safeJsonFetch<any>(url, {
        next: { revalidate: 300 },
        timeoutMs: 8000,
    });
}

export async function fetchAnimesOnAir() {
    const base = process.env.EXTERNAL_API_BASE!;
    const url = `${base}/api/list/animes-on-air`;

    // Home tolerante
    return safeJsonFetch<any>(url, {
        next: { revalidate: 300 },
        timeoutMs: 8000,
    });
}

export async function fetchAnimeBySlug(slug: string) {
    const base = process.env.EXTERNAL_API_BASE!;
    const url = `${base}/api/anime/${encodeURIComponent(slug)}`;

    // Detalle anime es crítico: si falla, no puedes renderizar esa página
    return strictJsonFetch<any>(url, {
        next: { revalidate: 300 },
        timeoutMs: 8000,
    });
}

export async function fetchAnimesByFilter(type: RealAnimeType, page = 1) {
    const base = process.env.EXTERNAL_API_BASE!;
    const url = `${base}/api/search/by-filter?order=title&page=${page}`;

    // Search/filtros: tolerante (mejor mostrar "no disponible" que romper)
    return safeJsonFetch<any>(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ types: [type] }),
        next: { revalidate: 300 },
        timeoutMs: 8000,
    });
}

export async function fetchSearchAnime(query: string, page = 1) {
    const base = process.env.EXTERNAL_API_BASE!;
    const url = `${base}/api/search?query=${encodeURIComponent(query)}&page=${page}`;

    // Search: tolerante
    return safeJsonFetch<any>(url, {
        next: { revalidate: 300 },
        timeoutMs: 8000,
    });
}

export async function fetchServersEpisode(slug: string, number: number){
    const base = process.env.EXTERNAL_API_BASE!;
    const url = `${base}/api/anime/${slug}/episode/${number}`;

    return strictJsonFetch<any>(url, {
        next: { revalidate: 300 },
        timeoutMs: 8000,
    })
}

/**
 * AniList (NO debe romper nunca la web).
 * Devuelve null si falla (429, 5xx, network, etc.)
 */
const ANILIST_URL = "https://graphql.anilist.co";

function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

export async function fetchBannerFromAniListByTitle(title: string) {
    const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        id
        bannerImage
        coverImage { extraLarge large }
        title { romaji english native }
      }
    }
  `;

    // Reintento ligero (por rate limit / picos)
    for (let attempt = 0; attempt < 2; attempt++) {
        const json = await safeJsonFetch<any>(ANILIST_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "User-Agent": "AnimeFlick-Web/1.0",
            },
            body: JSON.stringify({ query, variables: { search: title } }),
            next: { revalidate: 86400 }, // 1 día
            timeoutMs: 8000,
        });

        const media = json?.data?.Media;
        if (media) {
            return {
                id: media.id,
                banner: media.bannerImage ?? null,
                cover: media.coverImage?.extraLarge ?? media.coverImage?.large ?? null,
                title: media.title?.romaji ?? media.title?.english ?? media.title?.native ?? title,
            };
        }

        // si falló o no encontró y es el primer intento, espera un poco y reintenta
        if (attempt === 0) await sleep(600);
    }

    return null;
}
