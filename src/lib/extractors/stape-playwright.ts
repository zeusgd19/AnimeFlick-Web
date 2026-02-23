import type { ExtractResult } from "@/app/api/extract/route";
import { chromium } from "playwright";

function normalize(u: string) {
    if (!u) return u;
    if (u.startsWith("//")) return `https:${u}`;
    return u;
}

export async function extractStapeWithPlaywright(inputUrl: string): Promise<ExtractResult> {
    const browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
        const context = await browser.newContext({
            userAgent:
                "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36",
            locale: "es-ES",
            viewport: { width: 390, height: 844 },
        });

        const page = await context.newPage();
        await page.goto(inputUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });

        // <video id="mainvideo" src="..."> o <video id="mainvideo"><source src="...">
        const rawSrc: string | null =
            (await page
                .$eval("video#mainvideo", (el) => (el as HTMLVideoElement).getAttribute("src"))
                .catch(() => null)) ??
            (await page
                .$eval("video#mainvideo source", (el) => (el as HTMLSourceElement).getAttribute("src"))
                .catch(() => null));

        if (!rawSrc) return null;

        const intermediateUrl = normalize(rawSrc);

        // ✅ AQUÍ está la corrección: context.request YA es APIRequestContext
        // Pedimos SIN seguir redirects para leer Location
        const resp = await context.request.get(intermediateUrl, {
            headers: {
                Referer: inputUrl,
                "User-Agent":
                    "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36",
                Accept: "*/*",
            },
            maxRedirects: 0,
        });

        const headers = resp.headers();
        const location = headers["location"] || headers["Location"];
        if (!location) return null;

        const redirectedUrl = location;

        return {
            provider: "stape",
            kind: redirectedUrl.includes(".m3u8") ? "hls" : "mp4",
            url: redirectedUrl,
            headers: {
                Referer: redirectedUrl, // (imitando tu Kotlin)
                Range: "bytes=0-",
            },
            debug: { intermediateUrl },
        };
    } finally {
        await browser.close();
    }
}