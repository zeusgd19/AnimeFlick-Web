import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import type { ProgressAddWrapper, ProgressBody, ProgressStatus } from "@/types/progress";
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

const allowed: ProgressStatus[] = ["watching", "completed", "paused", "none"];
const isStatus = (v: any): v is ProgressStatus => allowed.includes(v);

export async function POST(req: Request) {
    const body = (await req.json()) as Partial<ProgressBody>;

    if (
        !body ||
        typeof body.anime_slug !== "string" ||
        typeof body.title !== "string" ||
        typeof body.cover !== "string" ||
        typeof body.rating !== "string" ||
        typeof body.type !== "string" ||
        !isStatus(body.status)
    ) {
        return NextResponse.json({ success: false, message: "Bad body" }, { status: 400 });
    }

    const base = process.env.EXTERNAL_USER_API_BASE;
    if (!base) {
        return NextResponse.json({ success: false, message: "Missing EXTERNAL_USER_API_BASE" }, { status: 500 });
    }

    const store = await cookies();
    const userRaw = store.get("af_user")?.value;
    const userId = userRaw ? JSON.parse(userRaw)?.id : null;

    // token lo sacamos del wrapper (ensureFreshAccessToken), no de cookies directamente
    const { upstream, ensuredResponse, refreshedTokens } = await fetchUpstreamWith401Retry((token) =>
        fetch(`${base}/anime/progress`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(body),
            cache: "no-store",
        })
    );

    // si no hay userId, auth inválida aunque tuvieras token
    if (!userId) {
        const out = NextResponse.json({ success: false, message: "NO_AUTH" }, { status: 401 });
        applyAuthCookiesToResponse(out, ensuredResponse, refreshedTokens);
        return out;
    }

    if (!upstream.ok) {
        const t = await upstream.text().catch(() => "");
        const out = NextResponse.json(
            { success: false, message: t || `Progress API error ${upstream.status}` },
            { status: upstream.status }
        );
        applyAuthCookiesToResponse(out, ensuredResponse, refreshedTokens);
        return out;
    }

    const json = (await safeJson(upstream)) as ProgressAddWrapper;

    // ✅ Next 16 requiere segundo argumento
    revalidateTag(`progress:${userId}`, "max");
    revalidateTag(`progress:${userId}:${body.status}`, "max");

    const out = NextResponse.json({ success: true, data: json }, { status: 200 });
    applyAuthCookiesToResponse(out, ensuredResponse, refreshedTokens);
    return out;
}
