export type FavoriteAnime = {
    anime_slug: string;
    title: string;
    cover: string;
    rating: string;
    type: string;
};

const KEY = "favoriteAnimes";
const SYNC_KEY = "favoriteAnimesSyncedAt";

// ------- Local storage helpers -------
export function getFavoriteAnimes(): FavoriteAnime[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(KEY);
        console.log(raw)
        const arr = JSON.parse(raw ?? "[]");
        return Array.isArray(arr) ? arr : [];
    } catch {
        return [];
    }
}

export function isFavorite(animeSlug: string): boolean {
    return getFavoriteAnimes().some(a => a.anime_slug === animeSlug);
}

export function upsertFavoriteLocal(anime: FavoriteAnime): boolean {
    const current = getFavoriteAnimes();
    const map = new Map<string, FavoriteAnime>();
    for (const a of current) map.set(a.anime_slug, a);
    map.set(anime.anime_slug, anime);
    localStorage.setItem(KEY, JSON.stringify(Array.from(map.values())));
    return true;
}

export function removeFavoriteLocal(animeSlug: string): boolean {
    const current = getFavoriteAnimes();
    const updated = current.filter(a => a.anime_slug !== animeSlug);
    localStorage.setItem(KEY, JSON.stringify(updated));
    return false;
}

export function mergeFavoriteAnimes(animes: FavoriteAnime[]) {
    if (typeof window === "undefined") return;

    const current = getFavoriteAnimes();
    const map = new Map<string, FavoriteAnime>();

    console.log(animes)
    for (const a of current) map.set(a.anime_slug, a);
    for (const a of animes) {
        if (!a?.anime_slug) continue;
        map.set(a.anime_slug, a);
    }

    localStorage.setItem(KEY, JSON.stringify(Array.from(map.values())));
    localStorage.setItem(SYNC_KEY, String(Date.now()));
}

// ------- Server sync -------
async function syncFavoritesFromServer() {
    try {
        const res = await fetch("/api/favorite", {
            method: "GET",
            cache: "no-store",
            credentials: "include",
        });

        console.log(res);

        if (!res.ok) return;

        const animes = await res.json().catch(() => null);



        mergeFavoriteAnimes(animes);
    } catch {
        // no rompas UI
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

// ------- Remote add/remove -------
export async function addFavoriteRemote(anime: FavoriteAnime) {
    const res = await fetch("/api/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(anime),
    });

    return res;
}

export async function removeFavoriteRemote(animeSlug: string) {
    // Si tu API usa otro endpoint, cámbialo:
    // por tu screenshot podría ser: "/api/favorite/delete"
    const res = await fetch("/api/favorite/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ anime_slug: animeSlug }),
    });

    return res;
}
