import { NextRequest, NextResponse } from "next/server";
import { ensureFreshAccessToken } from "@/lib/auth/ensure-access";
import { getAuthFromCookies, setAuthCookies, clearAuthCookies } from "@/lib/auth/cookies";
import { refreshWithBackend } from "@/lib/auth/refresh";

const USER_API = process.env.EXTERNAL_USER_API_BASE!;

// Copia los Set-Cookie de una response (p.ej. NextResponse.next()) a tu response final JSON
function mergeSetCookieHeaders(from: Response, to: NextResponse) {
    // Next/undici suele tener getSetCookie()
    const anyHeaders = from.headers as any;
    const list: string[] | undefined = anyHeaders.getSetCookie?.();
    if (Array.isArray(list) && list.length) {
        for (const c of list) to.headers.append("set-cookie", c);
        return;
    }
    // fallback simple
    const sc = from.headers.get("set-cookie");
    if (sc) to.headers.append("set-cookie", sc);
}

async function fetchJson(res: Response) {
    return await res.json().catch(() => null);
}

// Helper genérico: añade Authorization y hace retry tras 401
async function fetchUpstreamWith401Retry(
    req: NextRequest,
    makeRequest: (accessToken: string) => Promise<Response>
) {
    // 1) proactivo por expiresAt
    const ensured = await ensureFreshAccessToken();
    const { refresh } = await getAuthFromCookies();

    const access = ensured.access ?? "";
    if (!access) {
        return {
            upstream: new Response(null, { status: 401 }),
            ensuredResponse: ensured.response,
            refreshedTokens: null as null | { access_token: string; refresh_token: string; expires_in?: number | null },
        };
    }

    // 2) primera llamada
    let upstream = await makeRequest(access);

    // 3) si 401, refresh + retry 1 vez
    if (upstream.status === 401 && refresh) {
        try {
            const tokens = await refreshWithBackend(refresh);
            upstream = await makeRequest(tokens.access_token);
            return { upstream, ensuredResponse: ensured.response, refreshedTokens: tokens };
        } catch (e) {
            // opcional: si refresh falla, limpias cookies
            return { upstream, ensuredResponse: ensured.response, refreshedTokens: "CLEAR" as any };
        }
    }

    return { upstream, ensuredResponse: ensured.response, refreshedTokens: null };
}

export async function GET(req: NextRequest) {
    const { upstream, ensuredResponse, refreshedTokens } = await fetchUpstreamWith401Retry(
        req,
        (token) =>
            fetch(`${USER_API}/favorites`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
            })
    );

    const json = await fetchJson(upstream);

    const out = NextResponse.json(
        json?.favorites ?? { favorites: [] }, // (arreglado typo)
        { status: upstream.status }
    );

    // si el proactivo refrescó (expiresAt) -> copia Set-Cookie
    if (ensuredResponse) mergeSetCookieHeaders(ensuredResponse, out);

    // si refrescamos por 401 -> setea cookies aquí (mejor que copiar)
    if (refreshedTokens && refreshedTokens !== ("CLEAR" as any)) {
        setAuthCookies(out, refreshedTokens);
    } else if (refreshedTokens === ("CLEAR" as any)) {
        clearAuthCookies(out);
    }

    return out;
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ message: "Invalid body" }, { status: 400 });

    const { upstream, ensuredResponse, refreshedTokens } = await fetchUpstreamWith401Retry(
        req,
        (token) =>
            fetch(`${USER_API}/favorites/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
                cache: "no-store",
            })
    );

    const json = await fetchJson(upstream);

    const out = NextResponse.json(json ?? { message: "Upstream error" }, { status: upstream.status });

    if (ensuredResponse) mergeSetCookieHeaders(ensuredResponse, out);

    if (refreshedTokens && refreshedTokens !== ("CLEAR" as any)) {
        setAuthCookies(out, refreshedTokens);
    } else if (refreshedTokens === ("CLEAR" as any)) {
        clearAuthCookies(out);
    }

    return out;
}
