// src/lib/providers/anime.ts
import "server-only";
import { RealAnimeType } from "@/types/anime";
import * as cheerio from "cheerio";

// ---------------------------------------------------------
// Helpers
// ---------------------------------------------------------
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

// ---------------------------------------------------------
// Fallback Scraper (TioAnime)
// ---------------------------------------------------------
const TIO_BASE_URL = "https://tioanime.com";

async function fetchHtmlFallback(url: string, nextOpts?: any, timeoutMs = 8000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            },
            next: nextOpts,
            signal: controller.signal,
        });

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return await res.text();
    } finally {
        clearTimeout(timeout);
    }
}

async function fallbackLatestEpisodes() {
    const html = await fetchHtmlFallback(`${TIO_BASE_URL}/`, { revalidate: 300 });
    const $ = cheerio.load(html);

    const data: any[] = [];
    $('.episodes li').each((_, el) => {
        const title = $(el).find('h3.title').text().trim();
        const url = $(el).find('a').attr('href') || "";
        const img = $(el).find('img').attr('src') || "";

        const fullSlug = url.split('/').pop() || "";
        const match = fullSlug.match(/(.+)-(\d+)$/);
        let slug = fullSlug;
        let episode = 1;
        if (match) {
            slug = match[1];
            episode = parseInt(match[2], 10);
        }

        data.push({
            title,
            slug: fullSlug,
            number: episode,
            cover: `https://animeflick.com/api/image?url=${encodeURIComponent(TIO_BASE_URL + img)}`,
            url: fullSlug,
        });
    });

    return { success: true, data };
}

async function fallbackAnimesOnAir() {
    const data: any[] = [];
    let page = 1;

    while (true) {
        const html = await fetchHtmlFallback(
            `${TIO_BASE_URL}/directorio?year=1950%2C2026&status=1&sort=recent&p=${page}`,
            { revalidate: 300 }
        );
        const $ = cheerio.load(html);

        let count = 0;
        $('.animes .anime').each((_, el) => {
            const title = $(el).find('h3.title').text().trim();
            const url = $(el).find('a').attr('href') || "";
            const img = $(el).find('img').attr('src') || "";
            const slug = url.split('/').pop() || "";

            data.push({
                title,
                slug,
                cover: `https://animeflick.com/api/image?url=${encodeURIComponent(TIO_BASE_URL + img)}`,
                type: "TV",
            });
            count++;
        });

        if (count === 0) break;
        page++;
    }

    return { success: true, data };
}

async function fallbackAnimesByFilter(arg1: RealAnimeType | AnimeFilterParams, arg2?: number) {
    const isLegacy = typeof arg1 === "string";
    const page = isLegacy ? (arg2 ?? 1) : (arg1.page ?? 1);

    let url = `${TIO_BASE_URL}/directorio?p=${page}`;

    const typeMap: Record<string, number> = {
        "tv": 0,
        "movie": 1,
        "ova": 2,
        "special": 3
    };

    if (isLegacy) {
        if (typeMap[arg1 as string] !== undefined) {
            url += `&type[]=${typeMap[arg1 as string]}`;
        }
    } else {
        if (arg1.types && arg1.types.length > 0) {
            arg1.types.forEach(t => {
                if (typeMap[t] !== undefined) {
                    url += `&type[]=${typeMap[t]}`;
                }
            });
        }
        if (arg1.genres && arg1.genres.length > 0) {
            arg1.genres.forEach(g => {
                url += `&generos[]=${encodeURIComponent(g)}`;
            });
        }
        if (arg1.statuses && arg1.statuses.length > 0) {
            url += `&estado=${arg1.statuses[0]}`;
        }
    }

    const html = await fetchHtmlFallback(url, { revalidate: 300 });
    const $ = cheerio.load(html);

    const media: any[] = [];
    $('.animes .anime').each((_, el) => {
        const title = $(el).find('h3.title').text().trim();
        const urlPath = $(el).find('a').attr('href') || "";
        const img = $(el).find('img').attr('src') || "";
        const slug = urlPath.split('/').pop() || "";
        const typeBadge = $(el).find('span[class^="anime-type-"]').text().trim() || "Anime";

        media.push({
            title,
            slug,
            cover: `https://animeflick.com/api/image?url=${encodeURIComponent(TIO_BASE_URL + img)}`,
            rating: "4.0",
            type: typeBadge === "TV" ? "Anime" : typeBadge
        });
    });

    const paginationList = $('.pagination li');
    const lastPageEl = paginationList.not('.disabled').last().find('a').attr('href');
    let foundPages = page;
    if (lastPageEl) {
        const pMatch = lastPageEl.match(/p=(\d+)/);
        if (pMatch) foundPages = parseInt(pMatch[1], 10);
    }

    return {
        success: true,
        data: {
            currentPage: page,
            hasNextPage: page < foundPages,
            previousPage: page > 1 ? String(page - 1) : null,
            nextPage: page < foundPages ? String(page + 1) : null,
            foundPages,
            media
        }
    };
}

async function fallbackSearchAnime(query: string, page = 1) {
    const url = `${TIO_BASE_URL}/directorio?q=${encodeURIComponent(query)}&p=${page}`;
    const html = await fetchHtmlFallback(url, { revalidate: 300 });
    const $ = cheerio.load(html);

    const media: any[] = [];
    $('.animes .anime').each((_, el) => {
        const title = $(el).find('h3.title').text().trim();
        const urlPath = $(el).find('a').attr('href') || "";
        const img = $(el).find('img').attr('src') || "";
        const slug = urlPath.split('/').pop() || "";
        const typeBadge = $(el).find('span[class^="anime-type-"]').text().trim() || "Anime";

        media.push({
            title,
            slug,
            cover: `https://animeflick.com/api/image?url=${encodeURIComponent(TIO_BASE_URL + img)}`,
            rating: "4.0",
            type: typeBadge === "TV" ? "Anime" : typeBadge
        });
    });

    return {
        success: true,
        data: {
            media
        }
    };
}

async function fallbackAnimeBySlug(slug: string) {
    const url = `${TIO_BASE_URL}/anime/${slug}`;
    const html = await fetchHtmlFallback(url, { revalidate: 300 });
    const $ = cheerio.load(html);

    const title = $('h1.title').text().trim();
    const synopsis = $('.sinopsis').text().trim();
    const statusText = $('.fa-play-circle').parent().text().trim() || "Finalizado";
    const status = statusText;

    const type = $('.meta span[class^="anime-type-"]').text().trim() || "Anime";
    let rating = $('#score').text().trim() || "0";
    if (rating === "N/A" || rating === "0") {
        const jikanMatch = html.match(/fetch\('(https:\/\/api\.jikan\.moe[^']+)'\)/);
        if (jikanMatch) {
            try {
                const jikanRes = await fetch(jikanMatch[1], { next: { revalidate: 3600 } });
                if (jikanRes.ok) {
                    const jikanData = await jikanRes.json();
                    if (jikanData?.data?.score) {
                        rating = jikanData.data.score.toString();
                    }
                }
            } catch (e) {
                console.error("Failed to fetch jikan rating", e);
            }
        }
    }
    const genres: string[] = [];
    $('.genres a').each((_, el) => {
        genres.push($(el).text().trim());
    });

    const nextEpisodeMatch = html.match(/Proximo episodio:\s*<span>(.*?)<\/span>/);
    const next_airing_episode = nextEpisodeMatch ? nextEpisodeMatch[1] : null;

    const coverPath = $('.thumb img').attr('src') || "";
    const cover = `https://animeflick.com/api/image?url=${encodeURIComponent(TIO_BASE_URL + coverPath)}`;

    const episodes: any[] = [];
    const scriptMatch = html.match(/var episodes = (\[.*?\]);/);
    if (scriptMatch) {
        try {
            const epNums = JSON.parse(scriptMatch[1]);
            epNums.forEach((num: number) => {
                episodes.push({
                    number: num,
                    url: `${slug}-${num}`,
                    slug: `${slug}-${num}`
                });
            });
        } catch (e) { }
    }

    const related: { title: string; relation: string; slug: string; url: string }[] = [];
    $('section.w-history ul li').each((_, el) => {
        const anchor = $(el).find('.media-body a');
        const relTitle = anchor.find('h3.title').text().trim();
        const href = $(el).find('.thumb a').attr('href') || '';
        const relSlug = href.replace('/anime/', '');
        const relation = $(el).find('span[class^="anime-type-"]').text().trim() || 'Relacionado';
        if (relTitle && relSlug) {
            related.push({
                title: relTitle,
                relation,
                slug: relSlug,
                url: `/anime/${relSlug}`
            });
        }
    });

    return {
        success: true,
        data: {
            title,
            cover,
            synopsis,
            status,
            type,
            rating,
            genres,
            next_airing_episode,
            episodes,
            related
        }
    };
}

async function fallbackServersEpisode(slug: string, number: number) {
    const url = `${TIO_BASE_URL}/ver/${slug}-${number}`;
    const html = await fetchHtmlFallback(url, { revalidate: 300 });
    const $ = cheerio.load(html);

    let serversData: any[] = [];
    const scriptTags = $('script').map((i, el) => $(el).html()).get();
    for (const script of scriptTags) {
        if (script && script.includes('var videos = ')) {
            const match = script.match(/var videos = (\[.*?\]);/);
            if (match) {
                try {
                    serversData = JSON.parse(match[1]);
                } catch (e) { }
            }
        }
    }

    let servers = serversData.map((s: any) => ({
        name: s[0],
        embed: s[1],
    }));

    servers = servers.filter(s => !s.embed.includes('v.tioanime.com/embed.php'));

    const title = $('h1.title').text().trim() || slug;

    return {
        success: true,
        data: {
            title: title,
            number: number,
            servers: servers
        }
    };
}

// ---------------------------------------------------------
// MAIN EXPORTS (TioAnime -> AnimeAV1 -> EXTERNAL_API)
// ---------------------------------------------------------

export async function fetchLatestEpisodesFromExternal() {
    try {
        const fallbackRes = await fallbackLatestEpisodes();
        if (fallbackRes && fallbackRes.success) return fallbackRes;
    } catch (f) {
        console.warn("[TioAnime] fallbackLatestEpisodes failed:", f?.toString());
    }
    try {
        const av1Res = await av1FallbackLatestEpisodes();
        if (av1Res && av1Res.success) return av1Res;
    } catch (f) {
        console.warn("[AnimeAV1] av1FallbackLatestEpisodes failed:", f?.toString());
    }
    try {
        const base = process.env.EXTERNAL_API_BASE || "https://fallback.com";
        const url = `${base}/api/list/latest-episodes`;
        const res = await strictJsonFetch<any>(url, { next: { revalidate: 300 }, timeoutMs: 8000 });
        if (res && res.success) return res;
        throw new Error("Primary API returned invalid success");
    } catch (e) {
        console.warn("[Primary API] fetchLatestEpisodesFromExternal failed:", e?.toString());
        return null;
    }
}

export async function fetchAnimesOnAir() {
    try {
        const fallbackRes = await fallbackAnimesOnAir();
        if (fallbackRes && fallbackRes.success) return fallbackRes;
    } catch (f) {
        console.warn("[TioAnime] fallbackAnimesOnAir failed:", f?.toString());
    }
    try {
        const av1Res = await av1FallbackAnimesOnAir();
        if (av1Res && av1Res.success) return av1Res;
    } catch (f) {
        console.warn("[AnimeAV1] av1FallbackAnimesOnAir failed:", f?.toString());
    }
    try {
        const base = process.env.EXTERNAL_API_BASE || "https://fallback.com";
        const url = `${base}/api/list/animes-on-air`;
        const res = await strictJsonFetch<any>(url, { next: { revalidate: 300 }, timeoutMs: 8000 });
        if (res && res.success) return res;
        throw new Error("Primary API returned invalid success");
    } catch (e) {
        console.warn("[Primary API] fetchAnimesOnAir failed:", e?.toString());
        return null;
    }
}

export async function fetchAnimeBySlug(slug: string) {
    try {
        const fallbackRes = await fallbackAnimeBySlug(slug);
        if (fallbackRes && fallbackRes.success) return fallbackRes;
    } catch (f) {
        console.warn("[TioAnime] fallbackAnimeBySlug failed:", f?.toString());
    }
    try {
        const av1Res = await av1FallbackAnimeBySlug(slug);
        if (av1Res && av1Res.success) return av1Res;
    } catch (f) {
        console.warn("[AnimeAV1] av1FallbackAnimeBySlug failed:", f?.toString());
    }
    try {
        const base = process.env.EXTERNAL_API_BASE!;
        const url = `${base}/api/anime/${encodeURIComponent(slug)}`;
        const res = await strictJsonFetch<any>(url, { next: { revalidate: 300 }, timeoutMs: 8000 });
        if (res && res.success) return res;
        throw new Error("Primary API returned invalid success");
    } catch (e) {
        console.warn("[Primary API] fetchAnimeBySlug failed:", e?.toString());
        return null;
    }
}

export type FilterOrder = "title" | "rating" | "updated" | string;
export type AnimeFilterParams = {
    page?: number;
    order?: FilterOrder;
    types?: RealAnimeType[];
    genres?: string[];
    statuses?: number[];
};

export async function fetchAnimesByFilter(type: RealAnimeType, page?: number): Promise<any>;
export async function fetchAnimesByFilter(params: AnimeFilterParams): Promise<any>;
export async function fetchAnimesByFilter(arg1: RealAnimeType | AnimeFilterParams, arg2?: number) {
    try {
        const fallbackRes = await fallbackAnimesByFilter(arg1, arg2);
        if (fallbackRes && fallbackRes.success) return fallbackRes;
    } catch (f) {
        console.warn("[TioAnime] fallbackAnimesByFilter failed:", f?.toString());
    }
    try {
        const av1Res = await av1FallbackAnimesByFilter(arg1, arg2);
        if (av1Res && av1Res.success) return av1Res;
    } catch (f) {
        console.warn("[AnimeAV1] av1FallbackAnimesByFilter failed:", f?.toString());
    }
    try {
        const base = process.env.EXTERNAL_API_BASE!;
        const isLegacy = typeof arg1 === "string";
        const page = isLegacy ? (arg2 ?? 1) : (arg1.page ?? 1);
        const order = isLegacy ? "title" : (arg1.order ?? "title");

        const bodyObj: Record<string, any> = {};
        if (isLegacy) {
            bodyObj.types = [arg1];
        } else {
            if (arg1.types?.length) bodyObj.types = arg1.types;
            if (arg1.genres?.length) bodyObj.genres = arg1.genres;
            if (arg1.statuses?.length) bodyObj.statuses = arg1.statuses;
        }

        const url = `${base}/api/search/by-filter?order=${encodeURIComponent(order)}&page=${page}`;
        const res = await strictJsonFetch<any>(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyObj),
            next: { revalidate: 300 },
            timeoutMs: 8000,
        });

        if (res && res.success) {
            return res;
        }
        throw new Error("Primary API returned invalid success");
    } catch (e) {
        console.warn("[Primary API] fetchAnimesByFilter failed:", e?.toString());
        return null;
    }
}

export async function fetchSearchAnime(query: string, page = 1) {
    try {
        const fallbackRes = await fallbackSearchAnime(query, page);
        if (fallbackRes && fallbackRes.success) return fallbackRes;
    } catch (f) {
        console.warn("[TioAnime] fallbackSearchAnime failed:", f?.toString());
    }
    try {
        const av1Res = await av1FallbackSearchAnime(query, page);
        if (av1Res && av1Res.success) return av1Res;
    } catch (f) {
        console.warn("[AnimeAV1] av1FallbackSearchAnime failed:", f?.toString());
    }
    try {
        const base = process.env.EXTERNAL_API_BASE!;
        const url = `${base}/api/search?query=${encodeURIComponent(query)}&page=${page}`;
        const res = await strictJsonFetch<any>(url, { next: { revalidate: 300 }, timeoutMs: 8000 });
        if (res && res.success) return res;
        throw new Error("Primary API returned invalid success");
    } catch (e) {
        console.warn("[Primary API] fetchSearchAnime failed:", e?.toString());
        return null;
    }
}

// ---------------------------------------------------------
// AnimeAV1 Scraper (Full Fallback + Primary Source for Embeds)
// ---------------------------------------------------------
const ANIMEAV1_BASE_URL = "https://animeav1.com";
const ANIMEAV1_CDN = "https://cdn.animeav1.com";

/** Map AV1 numeric status to human-readable text */
function av1StatusText(status: number): string {
    switch (status) {
        case 1: return "En emision";
        case 0: return "Finalizado";
        default: return "En emision";
    }
}

/** Map AV1 category to the type string we use */
function av1CategoryToType(category: any): string {
    if (!category) return "Anime";
    const name = typeof category === "string" ? category : (category.name || "");
    if (name.includes("Pelicula") || name.includes("Película")) return "Película";
    if (name.includes("OVA")) return "OVA";
    if (name.includes("Especial")) return "Especial";
    if (name.includes("ONA")) return "ONA";
    return "TV";
}

/**
 * Parse catalog results from AnimeAV1 SvelteKit hydration data.
 * The catalog pages embed results as: results:[{...},{...}],total:N
 * Category references are serialized as single letters (a, b, c…) that
 * refer to previously defined category objects. We handle this gracefully.
 */
function parseAV1CatalogResults(html: string): { results: any[]; total: number } {
    const resultsMatch = html.match(/results:\[([\s\S]*?)\],total:/);
    const totalMatch = html.match(/total:(\d+)/);

    if (!resultsMatch) return { results: [], total: 0 };

    const total = totalMatch ? parseInt(totalMatch[1], 10) : 0;
    const raw = resultsMatch[1];

    // Extract individual entries using regex since the data isn't valid JSON
    const entries: any[] = [];
    const entryRegex = /\{id:"(\d+)",title:"([^"]*)"(?:,synopsis:"([^"]*)")?(?:,categoryId:(\d+))?,slug:"([^"]+)"(?:,category:(\{[^}]+\}|[a-z]))?\}/g;
    let m;
    while ((m = entryRegex.exec(raw)) !== null) {
        entries.push({
            id: m[1],
            title: m[2],
            synopsis: m[3] || "",
            categoryId: m[4] ? parseInt(m[4], 10) : 1,
            slug: m[5],
            categoryRaw: m[6] || null,
        });
    }

    return { results: entries, total };
}

// Cache for slug mappings: AnimeFLV slug -> AnimeAV1 slug
const slugCache = new Map<string, string | null>();

/**
 * Search AnimeAV1 catalog to find the correct slug for an anime.
 * AnimeFLV and AnimeAV1 use different slug formats (e.g. "nakamurakun" vs "nakamura-kun").
 */
async function resolveAnimeAV1Slug(animeFlvSlug: string): Promise<string | null> {
    if (slugCache.has(animeFlvSlug)) {
        return slugCache.get(animeFlvSlug) ?? null;
    }

    try {
        // Convert slug to search query: "ganbare-nakamurakun" -> "ganbare nakamurakun"
        const searchQuery = animeFlvSlug.replace(/-/g, " ");
        const searchUrl = `${ANIMEAV1_BASE_URL}/catalogo?search=${encodeURIComponent(searchQuery)}`;
        const html = await fetchHtmlFallback(searchUrl, { revalidate: 3600 }, 10000);

        // Extract results from SvelteKit hydration data
        // Pattern: results:[{...slug:"the-slug"...},...]
        const resultsMatch = html.match(/results:\[(.*?)\],total:/);
        if (!resultsMatch) {
            slugCache.set(animeFlvSlug, null);
            return null;
        }

        // Extract all slugs from the results
        const slugMatches = resultsMatch[1].matchAll(/slug:"([^"]+)"/g);
        const foundSlugs: string[] = [];
        for (const m of slugMatches) {
            foundSlugs.push(m[1]);
        }

        if (foundSlugs.length === 0) {
            slugCache.set(animeFlvSlug, null);
            return null;
        }

        // Try to find the best match:
        // 1. Exact match
        if (foundSlugs.includes(animeFlvSlug)) {
            slugCache.set(animeFlvSlug, animeFlvSlug);
            return animeFlvSlug;
        }

        // 2. Slug contains the original (e.g. "nakamura-kun" contains "nakamurakun" when normalized)
        const normalizedInput = animeFlvSlug.replace(/-/g, "");
        for (const s of foundSlugs) {
            const normalizedCandidate = s.replace(/-/g, "");
            if (normalizedCandidate === normalizedInput) {
                slugCache.set(animeFlvSlug, s);
                console.log(`[AnimeAV1] Resolved slug "${animeFlvSlug}" -> "${s}"`);
                return s;
            }
        }

        // 3. First result as best guess
        const bestGuess = foundSlugs[0];
        slugCache.set(animeFlvSlug, bestGuess);
        console.log(`[AnimeAV1] Best guess slug "${animeFlvSlug}" -> "${bestGuess}"`);
        return bestGuess;
    } catch (e) {
        console.warn("[AnimeAV1] resolveAnimeAV1Slug failed:", e?.toString());
        slugCache.set(animeFlvSlug, null);
        return null;
    }
}

// ---------------------------------------------------------
// AnimeAV1 Fallback Functions (Full Provider)
// ---------------------------------------------------------

async function av1FallbackLatestEpisodes() {
    const html = await fetchHtmlFallback(`${ANIMEAV1_BASE_URL}/`, { revalidate: 300 }, 10000);

    // Extract latestEpisodes from SvelteKit hydration data
    const match = html.match(/latestEpisodes:\[([\s\S]*?)\]/);
    if (!match) throw new Error("No latestEpisodes found in AnimeAV1 home");

    const data: any[] = [];
    // Pattern: {commentsCount:N,createdAt:"...",id:N,media:{id:N,slug:"...",title:"..."},number:N,publishedAt:"..."}
    const epRegex = /\{[^}]*media:\{id:(\d+),slug:"([^"]+)",title:"([^"]+)"\},number:(\d+)/g;
    let m;
    while ((m = epRegex.exec(match[1])) !== null) {
        const mediaId = m[1];
        const slug = m[2];
        const title = m[3];
        const number = parseInt(m[4], 10);

        data.push({
            title,
            slug: `${slug}-${number}`,
            number,
            cover: `${ANIMEAV1_CDN}/thumbnails/${mediaId}.jpg`,
            url: `${slug}-${number}`,
        });
    }

    if (data.length === 0) throw new Error("No episodes parsed from AnimeAV1 home");
    return { success: true, data };
}

async function av1FallbackAnimesOnAir() {
    const data: any[] = [];
    const perPage = 28; // AnimeAV1 shows ~28 per page
    let page = 1;

    while (true) {
        const url = `${ANIMEAV1_BASE_URL}/catalogo?status=En+Emisi%C3%B3n&page=${page}`;
        const html = await fetchHtmlFallback(url, { revalidate: 300 }, 10000);
        const { results, total } = parseAV1CatalogResults(html);

        if (results.length === 0) break;

        for (const entry of results) {
            data.push({
                title: entry.title,
                slug: entry.slug,
                cover: `${ANIMEAV1_CDN}/covers/${entry.id}.jpg`,
                type: "TV",
            });
        }

        if (page * perPage >= total) break;
        page++;
    }

    return { success: true, data };
}

async function av1FallbackSearchAnime(query: string, page = 1) {
    const url = `${ANIMEAV1_BASE_URL}/catalogo?search=${encodeURIComponent(query)}&page=${page}`;
    const html = await fetchHtmlFallback(url, { revalidate: 300 }, 10000);
    const { results } = parseAV1CatalogResults(html);

    const media = results.map(entry => ({
        title: entry.title,
        slug: entry.slug,
        cover: `${ANIMEAV1_CDN}/covers/${entry.id}.jpg`,
        rating: "4.0",
        type: "Anime",
    }));

    return { success: true, data: { media } };
}

async function av1FallbackAnimesByFilter(arg1: RealAnimeType | AnimeFilterParams, arg2?: number) {
    const isLegacy = typeof arg1 === "string";
    const page = isLegacy ? (arg2 ?? 1) : (arg1.page ?? 1);

    let url = `${ANIMEAV1_BASE_URL}/catalogo?page=${page}`;

    // Map type filter
    const av1TypeMap: Record<string, string> = {
        "tv": "TV Anime",
        "movie": "Pelicula",
        "ova": "OVA",
        "special": "Especial",
    };

    if (isLegacy) {
        if (av1TypeMap[arg1 as string]) {
            url += `&category=${encodeURIComponent(av1TypeMap[arg1 as string])}`;
        }
    } else {
        if (arg1.types && arg1.types.length > 0) {
            const firstType = arg1.types[0];
            if (av1TypeMap[firstType]) {
                url += `&category=${encodeURIComponent(av1TypeMap[firstType])}`;
            }
        }
        if (arg1.genres && arg1.genres.length > 0) {
            url += `&genre=${encodeURIComponent(arg1.genres[0])}`;
        }
        if (arg1.statuses && arg1.statuses.length > 0) {
            const statusMap: Record<number, string> = { 1: "En Emisión", 2: "Finalizado" };
            const statusStr = statusMap[arg1.statuses[0]];
            if (statusStr) url += `&status=${encodeURIComponent(statusStr)}`;
        }
    }

    const html = await fetchHtmlFallback(url, { revalidate: 300 }, 10000);
    const { results, total } = parseAV1CatalogResults(html);

    const perPage = 28;
    const foundPages = Math.ceil(total / perPage);

    const media = results.map(entry => ({
        title: entry.title,
        slug: entry.slug,
        cover: `${ANIMEAV1_CDN}/covers/${entry.id}.jpg`,
        rating: "4.0",
        type: "Anime",
    }));

    return {
        success: true,
        data: {
            currentPage: page,
            hasNextPage: page < foundPages,
            previousPage: page > 1 ? String(page - 1) : null,
            nextPage: page < foundPages ? String(page + 1) : null,
            foundPages,
            media
        }
    };
}

async function av1FallbackAnimeBySlug(slug: string) {
    // Try the slug as-is first; if 404, try resolving via search
    let html: string;
    let usedSlug = slug;
    try {
        html = await fetchHtmlFallback(`${ANIMEAV1_BASE_URL}/media/${slug}`, { revalidate: 300 }, 10000);
    } catch (e: any) {
        if (e?.message?.includes("404")) {
            const resolved = await resolveAnimeAV1Slug(slug);
            if (!resolved || resolved === slug) throw new Error(`AV1: slug "${slug}" not found`);
            usedSlug = resolved;
            html = await fetchHtmlFallback(`${ANIMEAV1_BASE_URL}/media/${usedSlug}`, { revalidate: 300 }, 10000);
        } else {
            throw e;
        }
    }

    // Extract the SvelteKit media data block
    const titleMatch = html.match(/title:"([^"]+)"/);
    const title = titleMatch ? titleMatch[1] : slug;

    const synopsisMatch = html.match(/synopsis:"((?:[^"\\]|\\.)*)"/);
    const synopsis = synopsisMatch ? synopsisMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"') : "";

    const statusMatch = html.match(/status:(\d+)/);
    const status = statusMatch ? av1StatusText(parseInt(statusMatch[1], 10)) : "Finalizado";

    const scoreMatch = html.match(/score:([\d.]+)/);
    const rating = scoreMatch ? scoreMatch[1] : "0";

    const categoryMatch = html.match(/category:\{[^}]*name:"([^"]+)"/);
    const type = categoryMatch ? av1CategoryToType({ name: categoryMatch[1] }) : "TV";

    // Extract genres
    const genres: string[] = [];
    const genresMatch = html.match(/genres:\[([\s\S]*?)\]/);
    if (genresMatch) {
        const genreNameRegex = /name:"([^"]+)"/g;
        let gm;
        while ((gm = genreNameRegex.exec(genresMatch[1])) !== null) {
            genres.push(gm[1]);
        }
    }

    // Extract anime ID for cover
    const idMatch = html.match(/\{id:(\d+),categoryId/);
    const animeId = idMatch ? idMatch[1] : null;
    const cover = animeId ? `${ANIMEAV1_CDN}/covers/${animeId}.jpg` : "";

    // Extract episodes
    const episodes: any[] = [];
    const episodesMatch = html.match(/episodes:\[([\s\S]*?)\]/);
    if (episodesMatch) {
        const epNumRegex = /number:(\d+)/g;
        let em;
        while ((em = epNumRegex.exec(episodesMatch[1])) !== null) {
            const num = parseInt(em[1], 10);
            episodes.push({
                number: num,
                url: `${usedSlug}-${num}`,
                slug: `${usedSlug}-${num}`
            });
        }
    }

    // Extract next airing date
    const nextDateMatch = html.match(/nextDate:"([^"]+)"/);
    const next_airing_episode = nextDateMatch ? nextDateMatch[1].split("T")[0] : null;

    // Extract relations
    const related: { title: string; relation: string; slug: string; url: string }[] = [];
    const relationsMatch = html.match(/relations:\[([\s\S]*?)\]/);
    if (relationsMatch) {
        const relRegex = /slug:"([^"]+)",title:"([^"]+)"/g;
        let rm;
        while ((rm = relRegex.exec(relationsMatch[1])) !== null) {
            related.push({
                title: rm[2],
                relation: "Relacionado",
                slug: rm[1],
                url: `/anime/${rm[1]}`
            });
        }
    }

    return {
        success: true,
        data: {
            title,
            cover,
            synopsis,
            status,
            type,
            rating,
            genres,
            next_airing_episode,
            episodes,
            related
        }
    };
}

async function fetchAnimeAV1Page(slug: string, number: number) {
    const url = `${ANIMEAV1_BASE_URL}/media/${slug}/${number}`;
    return await fetchHtmlFallback(url, { revalidate: 300 }, 10000);
}

async function fetchEmbedsFromAnimeAV1(slug: string, number: number) {
    let html: string;

    try {
        // First try with the slug as-is
        html = await fetchAnimeAV1Page(slug, number);
    } catch (directError: any) {
        // If 404, try to resolve the correct slug via search
        if (directError?.message?.includes("404")) {
            console.log(`[AnimeAV1] Slug "${slug}" not found, searching...`);
            const resolvedSlug = await resolveAnimeAV1Slug(slug);
            if (!resolvedSlug || resolvedSlug === slug) {
                throw new Error(`AnimeAV1: slug "${slug}" not found and could not resolve`);
            }
            html = await fetchAnimeAV1Page(resolvedSlug, number);
        } else {
            throw directError;
        }
    }

    // The SvelteKit hydration script contains episode data inline.
    // We need to extract the embeds and downloads objects from the script.
    // Pattern: embeds:{SUB:[...],DUB:[...]},downloads:{SUB:[...],DUB:[...]}

    // Extract the full data block from the SvelteKit hydration script
    // Handle any combination: SUB only, DUB only, SUB+DUB, DUB+SUB
    const embedsMatch = html.match(/embeds:\{((?:(?:SUB|DUB):\[.*?\])(?:,(?:SUB|DUB):\[.*?\])?)\}/);
    const downloadsMatch = html.match(/downloads:\{((?:(?:SUB|DUB):\[.*?\])(?:,(?:SUB|DUB):\[.*?\])?)\}/);

    if (!embedsMatch) {
        throw new Error(`No embeds data found in AnimeAV1 page for ${slug} ep ${number}`);
    }

    // Parse the embeds and downloads JSON-like structures
    // They use {server:"name",url:"url"} format - we need to make it valid JSON
    function parseServerArray(raw: string): Array<{ server: string; url: string }> {
        try {
            // Convert JS object notation to JSON: {server:"X",url:"Y"} -> {"server":"X","url":"Y"}
            const jsonified = raw
                .replace(/([{,])\s*(server|url)\s*:/g, '$1"$2":')
                .replace(/void 0/g, 'null');
            return JSON.parse(jsonified);
        } catch {
            return [];
        }
    }

    function parseVariantBlock(rawBlock: string): Record<string, Array<{ server: string; url: string }>> {
        const result: Record<string, Array<{ server: string; url: string }>> = {};

        // Match SUB:[...] and DUB:[...]
        const variantRegex = /(SUB|DUB):\[(.*?)\](?=,(?:SUB|DUB):|$)/g;
        let m;
        while ((m = variantRegex.exec(rawBlock)) !== null) {
            const variant = m[1];
            const arrayContent = `[${m[2]}]`;
            result[variant] = parseServerArray(arrayContent);
        }

        return result;
    }

    const embeds = parseVariantBlock(embedsMatch[1]);
    const downloads = downloadsMatch ? parseVariantBlock(downloadsMatch[1]) : {};

    // Also try to extract the title from the page
    const titleMatch = html.match(/<a[^>]*class="hover:underline"[^>]*>([^<]+)<\/a>/);
    const title = titleMatch ? titleMatch[1].trim() : slug;

    // Build ServerEpisode[] combining embeds and downloads per variant
    const servers: Array<{ name: string; embed?: string; download?: string; variant?: "SUB" | "DUB" }> = [];

    for (const variant of ["SUB", "DUB"] as const) {
        const variantEmbeds = embeds[variant] ?? [];
        const variantDownloads = downloads[variant] ?? [];

        // Create a map of download URLs by server name
        const downloadMap = new Map<string, string>();
        for (const dl of variantDownloads) {
            downloadMap.set(dl.server, dl.url);
        }

        // Add servers from embeds
        for (const emb of variantEmbeds) {
            servers.push({
                name: emb.server,
                embed: emb.url,
                download: downloadMap.get(emb.server),
                variant,
            });
            downloadMap.delete(emb.server); // Remove so we don't duplicate
        }

        // Add remaining download-only servers
        for (const [serverName, dlUrl] of downloadMap) {
            servers.push({
                name: serverName,
                download: dlUrl,
                variant,
            });
        }
    }

    if (servers.length === 0) {
        throw new Error(`No servers found in AnimeAV1 for ${slug} ep ${number}`);
    }

    return {
        success: true,
        data: {
            title,
            number,
            servers,
        },
    };
}

export async function fetchServersEpisode(slug: string, number: number) {
    // 1. Try AnimeAV1 first (temporary primary source)
    try {
        const result = await fetchEmbedsFromAnimeAV1(slug, number);
        if (result && result.success && result.data.servers.length > 0) {
            console.log(`[AnimeAV1] fetchServersEpisode OK for ${slug} ep ${number}`);
            return result;
        }
    } catch (e) {
        console.warn("[AnimeAV1] fetchServersEpisode failed:", e?.toString());
    }

    // 2. Try TioAnime (NEW Primary)
    try {
        const result = await fallbackServersEpisode(slug, number);
        if (result && result.success && result.data.servers.length > 0) {
            console.log(`[TioAnime] fetchServersEpisode OK for ${slug} ep ${number}`);
            return result;
        }
    } catch (e) {
        console.warn("[TioAnime] fetchServersEpisode failed:", e?.toString());
    }

    // 3. Fallback to AnimeFLV API
    try {
        const base = process.env.EXTERNAL_API_BASE!;
        const url = `${base}/api/anime/${slug}/episode/${number}`;
        const res = await strictJsonFetch<any>(url, { next: { revalidate: 300 }, timeoutMs: 8000 });
        const servers = res?.data?.servers;
        const hasUsableServers = Array.isArray(servers) && servers.length > 0
            && servers.some((s: any) => s.embed || s.download);
        if (res && res.success && hasUsableServers) {
            console.log(`[AnimeFLV] fetchServersEpisode OK for ${slug} ep ${number}`);
            return res;
        }
        console.warn("[AnimeFLV] Response had no usable servers, skipping");
    } catch (e) {
        console.warn("[AnimeFLV] fetchServersEpisode failed:", e?.toString());
    }

    // All sources failed — return empty so the page shows error state
    console.error(`[All] fetchServersEpisode FAILED for ${slug} ep ${number}`);
    return {
        success: true,
        data: { title: slug, number, servers: [] },
    };
}

// ---------------------------------------------------------
// AniList
// ---------------------------------------------------------
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

    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            const res = await strictJsonFetch<any>(ANILIST_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "User-Agent": "AnimeFlick-Web/1.0",
                },
                body: JSON.stringify({ query, variables: { search: title } }),
                next: { revalidate: 86400 },
                timeoutMs: 8000,
            });

            const media = res?.data?.Media;
            if (media) {
                return {
                    id: media.id,
                    banner: media.bannerImage ?? null,
                    cover: media.coverImage?.extraLarge ?? media.coverImage?.large ?? null,
                    title: media.title?.romaji ?? media.title?.english ?? media.title?.native ?? title,
                };
            }
        } catch (e) { }

        if (attempt === 0) await sleep(600);
    }
    return null;
}
