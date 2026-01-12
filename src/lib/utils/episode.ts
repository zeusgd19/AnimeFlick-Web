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
const SYNC_KEY = "seenEpisodesSyncedAt";

// ------- Local storage helpers -------
export function getSeenEpisodes(): string[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(KEY);
        const arr = JSON.parse(raw ?? "[]");
        return Array.isArray(arr) ? arr : [];
    } catch {
        return [];
    }
}

export function isEpisodeSeen(slug: string): boolean {
    return getSeenEpisodes().includes(slug);
}

export function setEpisodeSeenLocal(slug: string, seen: boolean): boolean {
    const current = getSeenEpisodes();
    const updated = seen
        ? Array.from(new Set([...current, slug]))
        : current.filter((s) => s !== slug);

    localStorage.setItem(KEY, JSON.stringify(updated));
    return updated.includes(slug);
}

export function mergeSeenEpisodes(slugs: string[]) {
    if (typeof window === "undefined") return;
    const current = getSeenEpisodes();
    const merged = Array.from(new Set([...current, ...slugs]));
    localStorage.setItem(KEY, JSON.stringify(merged));
    localStorage.setItem(SYNC_KEY, String(Date.now()));
}

// ------- Server sync -------
// Idealmente tipa esto con tu estructura real. Aquí lo hago tolerante.

async function syncSeenEpisodesFromServer() {
    try {
        const res = await fetch("/api/watched", { method: "GET" });
        if (!res.ok) return;

        const json = await res.json();


        // ✅ Aquí depende de cómo te devuelva el backend.
        // Lo típico: { data: [{ episode_slug: "one-piece-1060" }, ...] }
        // Si tu backend devuelve { animes: [...] } cámbialo aquí.
        const items =
            json?.episodes ??
            [];

        const slugs: string[] = (Array.isArray(items) ? items : [])
            .map((x: any) => x?.episode_slug ?? x?.slug ?? x?.episodeSlug)
            .filter(Boolean);

        mergeSeenEpisodes(slugs);
    } catch {
        // silencio: si falla, no rompas UI
    }
}

// Para evitar múltiples GET (uno por EpisodeSeenToggle)
let syncPromise: Promise<void> | null = null;

export function ensureSeenEpisodesSynced(force = false) {
    if (typeof window === "undefined") return Promise.resolve();

    // refresco “suave” cada X minutos, opcional
    const last = Number(localStorage.getItem(SYNC_KEY) ?? 0);
    const stale = Date.now() - last > 5 * 60 * 1000; // 5 min

    if (force || (!syncPromise && (last === 0 || stale))) {
        syncPromise = syncSeenEpisodesFromServer();
    }

    return syncPromise ?? Promise.resolve();
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

    if (!res.ok) throw new Error("Failed to mark watched");
    return res.json();
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

    if (!res.ok) throw new Error("Failed to mark watched");
    return res.json();
}

