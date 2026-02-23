import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function wrap(u: string, referer?: string) {
    const p = new URLSearchParams({ u });
    if (referer) p.set("r", referer);
    return `/api/hls?${p.toString()}`;
}

function rewritePlaylist(text: string, baseUrl: string, referer?: string) {
    const base = new URL(baseUrl);
    return text
        .split("\n")
        .map((line) => {
            const t = line.trim();
            if (!t || t.startsWith("#")) return line;

            if (/^https?:\/\//i.test(t)) return wrap(t, referer);
            if (t.startsWith("//")) return wrap(`https:${t}`, referer);

            const abs = new URL(t, base).toString();
            return wrap(abs, referer);
        })
        .join("\n");
}

async function fetchWithTimeout(url: string, headers: Record<string, string>, ms = 12000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    try {
        return await fetch(url, {
            method: "GET",
            headers,
            redirect: "follow",
            cache: "no-store",
            signal: controller.signal,
        });
    } finally {
        clearTimeout(id);
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const u = searchParams.get("u");
        const r = searchParams.get("r") || undefined;

        if (!u) return NextResponse.json({ error: "missing u" }, { status: 400 });

        const headers: Record<string, string> = {
            "user-agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
            accept: "*/*",
            ...(r ? { referer: r } : {}),
        };

        let res: Response;
        try {
            res = await fetchWithTimeout(u, headers, 12000);
        } catch (e: any) {
            console.error("[/api/hls] fetch failed:", u, e?.name, e?.message);
            // retry sin referer por si rompe
            const headers2 = { ...headers };
            delete headers2.referer;
            res = await fetchWithTimeout(u, headers2, 12000);
        }

        const status = res.status;
        const contentType = res.headers.get("content-type") || "";

        // playlist
        if (u.includes(".m3u8")) {
            const text = await res.text();
            const rewritten = rewritePlaylist(text, u, r);

            return new NextResponse(rewritten, {
                status,
                headers: {
                    "content-type": "application/vnd.apple.mpegurl",
                    "cache-control": "no-store",
                },
            });
        }

        // segmentos / keys
        const buf = await res.arrayBuffer();
        return new NextResponse(buf, {
            status,
            headers: {
                "content-type": contentType || "application/octet-stream",
                "cache-control": "no-store",
            },
        });
    } catch (e: any) {
        console.error("[/api/hls] error:", e?.name, e?.message ?? e);
        return NextResponse.json(
            { error: "proxy failed", detail: e?.message ?? String(e) },
            { status: 500 }
        );
    }
}