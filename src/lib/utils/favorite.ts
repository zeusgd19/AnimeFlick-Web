export type FavoriteAnime = {
    anime_slug: string;
    title: string;
    cover: string;
    rating: string;
    type: string;
};

const KEY = "favoriteAnimes";
const SYNC_KEY = "favoriteAnimesSyncedAt";

// ---------- Normalizer (server -> client shape) ----------
type FavoriteFromServer = {
    anime_slug?: string;
    slug?: string;
    title?: any;
    cover?: any;
    rating?: any;
    type?: any;
};

function normalizeFavorite(a: FavoriteFromServer): FavoriteAnime | null {
    const anime_slug = a?.anime_slug ?? a?.slug;
    if (!anime_slug) return null;

    return {
        anime_slug,
        title: typeof a.title === "string" ? a.title : "",
        cover: typeof a.cover === "string" ? a.cover : "",
        rating: typeof a.rating === "string" ? a.rating : "",
        type: typeof a.type === "string" ? a.type : "",
    };
}

function extractFavoritesPayload(payload: any): FavoriteFromServer[] {
    // soporta:
    // - [ ... ]
    // - { favorites: [ ... ] }
    // - { data: [ ... ] }
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.favorites)) return payload.favorites;
    if (payload && Array.isArray(payload.data)) return payload.data;
    return [];
}

// ---------- Local storage helpers ----------
export function getFavoriteAnimes(): FavoriteAnime[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(KEY);
        const arr = JSON.parse(raw ?? "[]");
        return Array.isArray(arr) ? arr : [];
    } catch {
        return [];
    }
}

export function isFavorite(animeSlug: string): boolean {
    return getFavoriteAnimes().some((a) => a.anime_slug === animeSlug);
}

export function upsertFavoriteLocal(anime: FavoriteAnime): boolean {
    if (typeof window === "undefined") return true;

    const current = getFavoriteAnimes();
    const map = new Map<string, FavoriteAnime>();
    for (const a of current) map.set(a.anime_slug, a);
    map.set(anime.anime_slug, anime);

    localStorage.setItem(KEY, JSON.stringify(Array.from(map.values())));
    return true;
}

export function removeFavoriteLocal(animeSlug: string): boolean {
    if (typeof window === "undefined") return false;

    const current = getFavoriteAnimes();
    const updated = current.filter((a) => a.anime_slug !== animeSlug);

    localStorage.setItem(KEY, JSON.stringify(updated));
    return false;
}

export function mergeFavoriteAnimes(animes: FavoriteAnime[]) {
    if (typeof window === "undefined") return;

    const current = getFavoriteAnimes();
    const map = new Map<string, FavoriteAnime>();

    for (const a of current) map.set(a.anime_slug, a);
    for (const a of animes) {
        if (!a?.anime_slug) continue;
        map.set(a.anime_slug, a);
    }

    localStorage.setItem(KEY, JSON.stringify(Array.from(map.values())));
    localStorage.setItem(SYNC_KEY, String(Date.now()));
}

// ---------- Server sync ----------
async function syncFavoritesFromServer() {
    try {
        const res = await fetch("/api/favorite", {
            method: "GET",
            cache: "no-store",
            credentials: "include",
        });

        if (!res.ok) return;

        const payload = await res.json().catch(() => null);

        const rawList = extractFavoritesPayload(payload);

        const normalized = rawList
            .map(normalizeFavorite)
            .filter((x): x is FavoriteAnime => Boolean(x));

        mergeFavoriteAnimes(normalized);
    } catch {
        // no rompas UI
    }
}

type RemoteFavoritesResult = {
    status: number;
    favorites: FavoriteAnime[];
};

async function fetchRemoteFavorites(): Promise<RemoteFavoritesResult> {
    try {
        const res = await fetch("/api/favorite", {
            method: "GET",
            cache: "no-store",
            credentials: "include",
        });

        const payload = await res.json().catch(() => null);
        const rawList = extractFavoritesPayload(payload);
        const normalized = rawList
            .map(normalizeFavorite)
            .filter((x): x is FavoriteAnime => Boolean(x));

        return { status: res.status, favorites: normalized };
    } catch {
        return { status: 0, favorites: [] };
    }
}

let syncPromise: Promise<void> | null = null;

export function ensureFavoritesSynced(force = false) {
    if (typeof window === "undefined") return Promise.resolve();

    const last = Number(localStorage.getItem(SYNC_KEY) ?? 0);
    const stale = Date.now() - last > 5 * 60 * 1000; // 5 min

    if (force || (!syncPromise && (last === 0 || stale))) {
        syncPromise = syncFavoritesFromServer();
    }

    return syncPromise ?? Promise.resolve();
}

// ---------- Local -> Server sync ----------
/*
export async function syncLocalFavoritesToRemote() {
    if (typeof window === "undefined") return;

    const local = getFavoriteAnimes();
    if (local.length === 0) return;

    const remote = await fetchRemoteFavorites();
    if (remote.status === 401 || remote.status === 0) return;

    const remoteSet = new Set(remote.favorites.map((f) => f.anime_slug));
    const missing = local.filter((f) => !remoteSet.has(f.anime_slug));

    for (const fav of missing) {
        try {
            await addFavoriteRemote(fav);
        } catch {
            // no rompas UI
        }
    }
}
*/

// ---------- Remote add/remove ----------
export async function addFavoriteRemote(anime: FavoriteAnime) {
    return await fetch("/api/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(anime),
    });
}

export async function removeFavoriteRemote(animeSlug: string) {
    return await fetch("/api/favorite/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ anime_slug: animeSlug }),
    });
}
