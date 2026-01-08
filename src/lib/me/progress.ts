import "server-only";

import { unstable_cache } from "next/cache";
import { cookies } from "next/headers";
import type { FilteredAnime } from "@/types/anime";

type ProgressAnimeResponse = {
    message?: string | null;
    animes: FilteredAnime[];
};

function safeUserIdFromCookie(raw?: string): string | null {
    if (!raw) return null;
    try {
        const u = JSON.parse(raw);
        return u?.id ?? null;
    } catch {
        return null;
    }
}

// ⚠️ Esta función NO usa cookies() dentro. Solo recibe args.
function cachedProgressFetch(userId: string, status: string, token: string) {
    return unstable_cache(
        async (): Promise<ProgressAnimeResponse> => {
            const base = process.env.EXTERNAL_USER_API_BASE;
            if (!base) throw new Error("Missing EXTERNAL_USER_API_BASE");

            const res = await fetch(
                `${base}/anime/progress?status=${encodeURIComponent(status)}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                    cache: "no-store", // el cache lo controla unstable_cache
                }
            );

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                throw new Error(`Progress API error (${res.status}) ${txt}`);
            }

            return res.json();
        },
        ["progress", userId, status], // ✅ clave por usuario+status
        {
            revalidate: 60 * 30, // 30 min (pon lo que quieras)
            tags: [`progress:${userId}`, `progress:${userId}:${status}`],
        }
    );
}

export async function getProgressCached(status: string) {
    const store = await cookies();

    const token = store.get("af_access")?.value;
    const userRaw = store.get("af_user")?.value;
    const userId = safeUserIdFromCookie(userRaw);

    if (!token || !userId) throw new Error("NO_AUTH");

    // crea la función cacheada y ejecútala
    return cachedProgressFetch(userId, status, token)();
}
