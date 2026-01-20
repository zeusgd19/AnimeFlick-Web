import { NextRequest, NextResponse } from "next/server";
import { ensureFreshAccessToken } from "@/lib/auth/ensure-access";
import { getAuthFromCookies, setAuthCookies, clearAuthCookies } from "@/lib/auth/cookies";
import { refreshWithBackend } from "@/lib/auth/refresh";

// Copia Set-Cookie de una response intermedia (NextResponse.next()) a tu response final
function mergeSetCookieHeaders(from: Response, to: NextResponse) {
    const anyHeaders = from.headers as any;
    const list: string[] | undefined = anyHeaders.getSetCookie?.();

    if (Array.isArray(list) && list.length) {
        for (const c of list) to.headers.append("set-cookie", c);
        return;
    }

    const sc = from.headers.get("set-cookie");
    if (sc) to.headers.append("set-cookie", sc);
}

async function safeJson(res: Response) {
    return await res.json().catch(() => null);
}

type RefreshResult =
    | null
    | { access_token: string; refresh_token: string; expires_in?: number | null }
    | "CLEAR";

async function fetchUpstreamWith401Retry(makeRequest: (accessToken: string) => Promise<Response>) {
    // 1) proactivo por expiresAt
    const ensured = await ensureFreshAccessToken();
    const { refresh } = await getAuthFromCookies();

    const access = ensured.access ?? "";
    if (!access) {
        return {
            upstream: new Response(null, { status: 401 }),
            ensuredResponse: ensured.response,
            refreshedTokens: null as RefreshResult,
        };
    }

    // 2) primera llamada
    let upstream = await makeRequest(access);

    // 3) si 401, refresh + retry 1 vez
    if (upstream.status === 401 && refresh) {
        try {
            const tokens = await refreshWithBackend(refresh);
            upstream = await makeRequest(tokens.access_token);
            return { upstream, ensuredResponse: ensured.response, refreshedTokens: tokens as RefreshResult };
        } catch {
            return { upstream, ensuredResponse: ensured.response, refreshedTokens: "CLEAR" as RefreshResult };
        }
    }

    return { upstream, ensuredResponse: ensured.response, refreshedTokens: null as RefreshResult };
}

function applyAuthCookiesToResponse(
    out: NextResponse,
    ensuredResponse: NextResponse | null,
    refreshedTokens: RefreshResult
) {
    // refresh “proactivo” (ensureFreshAccessToken) -> copiar headers
    if (ensuredResponse) mergeSetCookieHeaders(ensuredResponse, out);

    // refresh por 401 -> set cookies directamente / o limpiar
    if (refreshedTokens && refreshedTokens !== "CLEAR") {
        setAuthCookies(out, refreshedTokens);
    } else if (refreshedTokens === "CLEAR") {
        clearAuthCookies(out);
    }
}

const USER_API = process.env.EXTERNAL_USER_API_BASE!;

export async function GET(_req: NextRequest) {
    const { upstream, ensuredResponse, refreshedTokens } = await fetchUpstreamWith401Retry((token) =>
        fetch(`${USER_API}/anime/watched`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        })
    );

    const json = await safeJson(upstream);

    const out = NextResponse.json(
        json?.episodes ?? { episodes: [] },
        { status: upstream.status }
    );

    applyAuthCookiesToResponse(out, ensuredResponse, refreshedTokens);
    return out;
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => null);
    if (!body) {
        return NextResponse.json({ message: "Invalid body" }, { status: 400 });
    }

    const { upstream, ensuredResponse, refreshedTokens } = await fetchUpstreamWith401Retry((token) =>
        fetch(`${USER_API}/anime/watched`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
            cache: "no-store",
        })
    );

    const json = await safeJson(upstream);
    const out = NextResponse.json(json ?? { message: "Upstream error" }, { status: upstream.status });

    applyAuthCookiesToResponse(out, ensuredResponse, refreshedTokens);
    return out;
}
