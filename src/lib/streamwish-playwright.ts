import { chromium } from "playwright";
import type { ExtractResult } from "@/app/api/extract/route";

export async function extractStreamWishWithPlaywright(
    inputUrl: string
): Promise<ExtractResult> {
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

        let found: string | null = null;

        const capture = (u: string) => {
            if (found !== null) return;
            if (u.includes(".m3u8")) {
                found = u;
                console.log("[SW] found:", u);
            }
        };

        page.on("request", (r) => capture(r.url()));
        page.on("response", (r) => capture(r.url()));

        await page.goto(inputUrl, {
            waitUntil: "domcontentloaded",
            timeout: 45_000,
        });

        // intenta esperar a que el player arranque (no siempre existe selector)
        await page.waitForTimeout(1500);

        const start = Date.now();
        while (found === null && Date.now() - start < 12_000) {
            await page.waitForTimeout(300);
        }

        if (found === null) return null;

        // ✅ aquí arregla el type issue
        const foundUrl: string = found;

        const kind: "hls" | "mp4" = foundUrl.includes(".m3u8") ? "hls" : "mp4";

        return {
            provider: "streamwish",
            kind,
            url: foundUrl,
            headers: {},
        };
    } finally {
        await browser.close();
    }
}