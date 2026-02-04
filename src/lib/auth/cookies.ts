import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ACCESS_COOKIE = "af_access";
export const REFRESH_COOKIE = "af_refresh";
export const EXPIRES_AT_COOKIE = "af_expires_at"; // epoch ms

export type AuthTokens = {
    access_token: string;
    refresh_token: string;
    expires_in?: number | null; // segundos
};

export async function getAuthFromCookies() {
    const c = await cookies();
    const access = c.get(ACCESS_COOKIE)?.value ?? null;
    const refresh = c.get(REFRESH_COOKIE)?.value ?? null;
    const expiresAt = Number(c.get(EXPIRES_AT_COOKIE)?.value ?? 0) || 0;
    return { access, refresh, expiresAt };
}

export function isExpired(expiresAtMs: number, skewMs = 30_000) {
    // skew para refrescar un poco antes
    return !expiresAtMs || Date.now() >= (expiresAtMs - skewMs);
}

export function setAuthCookies(res: NextResponse, tokens: AuthTokens) {
    const isProd = process.env.NODE_ENV === "production";

    const accessMaxAge =
        tokens.expires_in && tokens.expires_in > 0 ? Math.floor(tokens.expires_in) : 60 * 60; // 1h fallback

    const refreshMaxAge = 60 * 60 * 24 * 30; // 30 días

    const expiresAt =
        Date.now() + accessMaxAge * 1000;

    const common = {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: isProd,
    };

    // ✅ PERSISTENTES (ya no "Session")
    res.cookies.set(ACCESS_COOKIE, tokens.access_token, {
        ...common,
        maxAge: accessMaxAge,
    });

    res.cookies.set(REFRESH_COOKIE, tokens.refresh_token, {
        ...common,
        maxAge: refreshMaxAge,
    });

    res.cookies.set(EXPIRES_AT_COOKIE, String(expiresAt), {
        ...common,
        httpOnly: false, // si lo quieres leer en client
        maxAge: refreshMaxAge, // o accessMaxAge si prefieres
    });

    return res;
}

export function clearAuthCookies(res: NextResponse) {
    res.cookies.set(ACCESS_COOKIE, "", { path: "/", maxAge: 0 });
    res.cookies.set(REFRESH_COOKIE, "", { path: "/", maxAge: 0 });
    res.cookies.set(EXPIRES_AT_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
}
