import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function pickHeader(h: Headers, name: string) {
    const v = h.get(name);
    return v ?? undefined;
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const u = searchParams.get("u");
        const r = searchParams.get("r") || undefined;

        if (!u) return NextResponse.json({ error: "missing u" }, { status: 400 });

        // ⚠️ importantísimo: reenviar el Range EXACTO del navegador (si no, seeks/audio desync)
        const range = req.headers.get("range") ?? "bytes=0-";

        const upstream = await fetch(u, {
            headers: {
                "user-agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
                accept: "*/*",
                range,
                ...(r ? { referer: r } : {}),
            },
            redirect: "follow",
            cache: "no-store",
        });

        // Reenviar status (200 o 206) y headers esenciales
        const outHeaders = new Headers();

        const ct = pickHeader(upstream.headers, "content-type");
        const cl = pickHeader(upstream.headers, "content-length");
        const cr = pickHeader(upstream.headers, "content-range");
        const ar = pickHeader(upstream.headers, "accept-ranges");

        if (ct) outHeaders.set("content-type", ct);
        if (cl) outHeaders.set("content-length", cl);
        if (cr) outHeaders.set("content-range", cr);
        if (ar) outHeaders.set("accept-ranges", ar);

        // CORS interno no hace falta porque es same-origin, pero por si acaso:
        outHeaders.set("cache-control", "no-store");

        // ✅ STREAM: no arrayBuffer, pasa el body tal cual
        return new NextResponse(upstream.body, {
            status: upstream.status,
            headers: outHeaders,
        });
    } catch (e: any) {
        console.error("[/api/file] error:", e?.name, e?.message ?? e);
        return NextResponse.json(
            { error: "file proxy failed", detail: e?.message ?? String(e) },
            { status: 500 }
        );
    }
}