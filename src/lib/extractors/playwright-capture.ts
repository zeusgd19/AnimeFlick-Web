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
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
            locale: "es-ES",
            viewport: { width: 1280, height: 720 },
        });

        const page = await context.newPage();

        // ✅ blindado
        let found: string | null = null;

        const capture = (u: string) => {
            if (found !== null) return;
            if (u.includes(".m3u8")) found = u;
            else if (/\.(mp4|mkv)(\?|$)/i.test(u)) found = u;
        };

        page.on("request", (r) => capture(r.url()));
        page.on("response", (r) => capture(r.url()));

        await page.goto(inputUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });

        const start = Date.now();
        while (found === null && Date.now() - start < 12_000) {
            await page.waitForTimeout(250);
        }

        if (found === null) return null;

        // ✅ foundUrl con tipo string garantizado
        const foundUrl: string = found;

        const kind: "hls" | "mp4" = foundUrl.includes(".m3u8") ? "hls" : "mp4";

        return {
            provider: "playwright",
            kind,
            url: foundUrl,
            headers: {},
        };
    } finally {
        await browser.close();
    }
}