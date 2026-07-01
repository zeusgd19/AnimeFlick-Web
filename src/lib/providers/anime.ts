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
    const html = await fetchHtmlFallback(`${TIO_BASE_URL}/directorio?estado=1`, { revalidate: 300 });
    const $ = cheerio.load(html);

    const data: any[] = [];
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
    });

    return { success: true, data: data.slice(0, 20) };
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
    let status = "0"; // Default finished
    if (statusText.toLowerCase().includes("emision")) status = "1";
    
    const rating = $('#score').text().trim() || "0";
    const genres: string[] = [];
    $('.genres a').each((_, el) => {
        genres.push($(el).text().trim());
    });

    const nextEpisodeMatch = html.match(/Proximo episodio:\s*<span>(.*?)<\/span>/);
    const next_airing_episode = nextEpisodeMatch ? nextEpisodeMatch[1] : null;

    const coverPath = $('.backdrop img').attr('src') || "";
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
        } catch(e) {}
    }

    return {
        success: true,
        data: {
            title,
            cover,
            synopsis,
            status,
            rating,
            genres,
            next_airing_episode,
            episodes
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
                } catch(e) {}
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
// MAIN EXPORTS (AnimeFLV Primary -> TioAnime Fallback)
// ---------------------------------------------------------

export async function fetchLatestEpisodesFromExternal() {
    try {
        const fallbackRes = await fallbackLatestEpisodes();
        if (fallbackRes && fallbackRes.success) return fallbackRes;
    } catch (f) {
        console.warn("[TioAnime] fallbackLatestEpisodes failed:", f?.toString());
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
        const base = process.env.EXTERNAL_API_BASE || "https://fallback.com";
        const url = `${base}/api/list/animes-on-air`;
        const res = await strictJsonFetch<any>(url, { next: { revalidate: 300 }, timeoutMs: 8000 });

        if (res && res.success) {
            return res;
        }
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
        const base = process.env.EXTERNAL_API_BASE!;
        const url = `${base}/api/anime/${encodeURIComponent(slug)}`;
        const res = await strictJsonFetch<any>(url, { next: { revalidate: 300 }, timeoutMs: 8000 });

        if (res && res.success) {
            return res;
        }
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
        const base = process.env.EXTERNAL_API_BASE!;
        const url = `${base}/api/search?query=${encodeURIComponent(query)}&page=${page}`;
        const res = await strictJsonFetch<any>(url, { next: { revalidate: 300 }, timeoutMs: 8000 });

        if (res && res.success) {
            return res;
        }
        throw new Error("Primary API returned invalid success");
    } catch (e) {
        console.warn("[Primary API] fetchSearchAnime failed:", e?.toString());
        return null;
    }
}

// ---------------------------------------------------------
// AnimeAV1 Scraper (Temporary Primary Source for Embeds)
// ---------------------------------------------------------
const ANIMEAV1_BASE_URL = "https://animeav1.com";

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
        } catch(e) {}

        if (attempt === 0) await sleep(600);
    }
    return null;
}
