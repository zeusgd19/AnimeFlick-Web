import "server-only";

import { unstable_cache } from "next/cache";
import { cookies } from "next/headers";
import type { FilteredAnime } from "@/types/anime";
import { isExpired } from "@/lib/auth/cookies";
import { refreshWithBackend } from "@/lib/auth/refresh";
import crypto from "node:crypto";

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

// Hash corto para que:
// - no metas el token en texto plano en la cache key
// - si cambia el access, cambie la key y no “arrastres” un 401 cacheado
function tokenKey(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex").slice(0, 12);
}

class UpstreamError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

// ⚠️ NO usa cookies() dentro. Solo recibe args.
function cachedProgressFetch(userId: string, status: string, token: string) {
    const tKey = tokenKey(token);

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
                throw new UpstreamError(res.status, txt || `Progress API error ${res.status}`);
            }

            return res.json();
        },
        ["progress", userId, status, tKey], // ✅ clave por user+status+tokenKey (evita 401 cacheado)
        {
            revalidate: 60 * 30,
            tags: [`progress:${userId}`, `progress:${userId}:${status}`],
        }
    );
}

export async function getProgressCached(status: string) {
    const store = await cookies();

    const access = store.get("af_access")?.value ?? null;
    const refresh = store.get("af_refresh")?.value ?? null;
    const expiresAt = Number(store.get("af_expires_at")?.value ?? 0) || 0;

    const userRaw = store.get("af_user")?.value;
    const userId = safeUserIdFromCookie(userRaw);

    if (!userId) throw new Error("NO_AUTH");
    if (!access && !refresh) throw new Error("NO_AUTH");

    // 1) proactivo por expiresAt (sin setear cookies; solo para esta request)
    let token = access ?? "";
    if (refresh && (!token || isExpired(expiresAt))) {
        const tokens = await refreshWithBackend(refresh);
        token = tokens.access_token;
    }

    if (!token) throw new Error("NO_AUTH");

    // 2) intento normal (cacheado)
    try {
        return await cachedProgressFetch(userId, status, token)();
    } catch (e: any) {
        const upstreamStatus = e?.status;

        // 3) si es 401, refresh + retry 1 vez
        if (upstreamStatus === 401 && refresh) {
            const tokens = await refreshWithBackend(refresh);
            token = tokens.access_token;

            // retry 1 vez (usa otra cache key gracias a tokenKey)
            return await cachedProgressFetch(userId, status, token)();
        }

        throw e;
    }
}
