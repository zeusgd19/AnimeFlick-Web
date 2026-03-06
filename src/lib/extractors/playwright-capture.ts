import type { ExtractResult } from "@/app/api/extract/route";
import { chromium } from "playwright";

export async function extractWithPlaywrightCapture(inputUrl: string): Promise<ExtractResult> {

    const browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {

        const context = await browser.newContext({
            userAgent:
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        });

        const page = await context.newPage();

        const streams: string[] = [];

        const push = (u: string) => {

            if (/doubleclick|googlesyndication|adservice|vast|popads|tracking/i.test(u))
                return;

            if (u.includes(".m3u8") || /\.(mp4|mkv)(\?|$)/i.test(u)) {

                if (!streams.includes(u)) {
                    streams.push(u);
                    console.log("STREAM:", u);
                }
            }
        };

        page.on("request", r => push(r.url()));
        page.on("response", r => push(r.url()));

        await page.goto(inputUrl, {
            waitUntil: "domcontentloaded",
            timeout: 45000
        });

        // esperar que cargue player + posibles ads
        await page.waitForTimeout(12000);

        if (streams.length === 0) return null;

        // usar el último (normalmente el real)
        const best = streams[streams.length - 1];

        const kind: "hls" | "mp4" =
            best.includes(".m3u8") ? "hls" : "mp4";

        return {
            provider: "playwright",
            kind,
            url: best,
            headers: {},
            debug: {
                allStreams: streams,
                picked: best
            }
        };

    } finally {
        await browser.close();
    }
}