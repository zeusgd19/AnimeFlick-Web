import { unpack, detect } from "unpacker";

const packedRegex2 =
    /eval\((function\(p,a,c,k,e,?[dr]?\)[\s\S]*?\.split\('\|'\)[\s\S]*?)\)/;

export function extractLink(text: string): string | null {
    // 1) primero busca URL absoluta
    const abs = text.match(/https?:\/\/[^\s"'<>]+/i);
    if (abs?.[0]) return abs[0];

    // 2) luego busca //dominio/...
    const protoRel = text.match(/\/\/[^\s"'<>]+/);
    if (protoRel?.[0]) return `https:${protoRel[0]}`;

    // 3) por último, busca una ruta que parezca embed/download, no cualquier /assets
    const rel = text.match(/\/(?:embed|e|d|download|v)\/[^\s"'<>]+/i);
    return rel?.[0] ?? null;
}

function normalizeUrl(u: string, base?: string) {
    if (!u) throw new Error("empty url");
    if (u.startsWith("//")) return `https:${u}`;
    if (/^https?:\/\//i.test(u)) return u;
    if (!base) throw new Error(`relative url without base: ${u}`);
    return new URL(u, base).toString();
}

async function getHtml(url: string): Promise<string> {
    const res = await fetch(url, {
        headers: {
            "user-agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
            accept: "text/html,*/*",
            "accept-language": "es-ES,es;q=0.9,en;q=0.8",
            // a veces ayuda:
            referer: "https://streamwish.to/",
            // "sec-fetch-site": "same-origin", // (no siempre lo permite fetch)
        },
        redirect: "follow",
        cache: "no-store",
    });

    const html = await res.text();

    console.log("FETCH", url, "->", res.status, res.url, "len:", html.length);
    console.log("HEAD:", html.slice(0, 300).replace(/\s+/g, " "));

    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
    return html;
}

function findM3u8(text: string): string | null {
    // 1) cualquier URL directa a m3u8 (con o sin escapes)
    const m1 = text.match(/https?:\/\/[^\s"'\\]+\.m3u8[^\s"']*/i);
    if (m1?.[0]) return m1[0].replace(/\\u0026/g, "&").replace(/\\/g, "");

    // 2) file:"...m3u8" o hls:"...m3u8"
    const m2 = text.match(/(?:file|hls|src)\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i);
    if (m2?.[1]) return m2[1].replace(/\\u0026/g, "&").replace(/\\/g, "");

    // 3) JSON-ish "file":"...m3u8"
    const m3 = text.match(/"file"\s*:\s*"([^"]+\.m3u8[^"]*)"/i);
    if (m3?.[1]) return m3[1].replace(/\\u0026/g, "&").replace(/\\/g, "");

    return null;
}

export async function unpackWeb(link: string, base?: string): Promise<string> {
    const url = normalizeUrl(link, base);
    const html = await getHtml(link);

    const match = html.match(packedRegex2);
    const packedInner = match?.[1];
    if (!packedInner) return html;

    // reconstruimos el eval(...) completo porque tu regex captura el interior
    const packedFull = `eval(${packedInner})`;

    try {
        // opcional: si detect() dice que no está packed, devolvemos html
        if (!detect(packedFull)) return html;

        const unpacked = unpack(packedFull);
        return typeof unpacked === "string" && unpacked.trim().length
            ? unpacked
            : html;
    } catch {
        return html;
    }
}

function findAjaxEndpoint(html: string): string | null {
    // ejemplos típicos: /ajax/embed/get?id=...  o  /dl?op=...
    const m = html.match(/\/ajax\/[^\s"'<>]+/i);
    return m?.[0] ?? null;
}

export async function extractStreamWishVideo(input: string) {
    const pageUrl = normalizeUrl(input);
    const html = await getHtml(pageUrl);

    // intenta unpack + m3u8
    const unpacked = await unpackWeb(pageUrl);
    const direct = findM3u8(unpacked) ?? findM3u8(html);
    console.log("Direct:" + direct);
    if (direct) return { link: direct, headers: {} };

    // intenta ajax
    const ajaxRel = findAjaxEndpoint(html);
    if (ajaxRel) {
        const ajaxUrl = normalizeUrl(ajaxRel, pageUrl);
        const ajaxText = await getHtml(ajaxUrl);
        const m3u8 = findM3u8(ajaxText);
        console.log("m3u8:" + m3u8);
        if (m3u8) return { link: m3u8, headers: {} };
    }

    return null;
}