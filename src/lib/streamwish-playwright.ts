import { chromium } from "playwright";

export async function extractWithPlaywright(url: string): Promise<{ link: string; headers: Record<string,string> } | null> {
    const browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
        const page = await browser.newPage({
            userAgent:
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
            locale: "es-ES",
        });

        let found: string | null = null;

        const capture = (u: string) => {
            if (!found && u.includes(".m3u8")) found = u;
        };

        page.on("request", (r) => capture(r.url()));
        page.on("response", (r) => capture(r.url()));

        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });

        // espera a que el player dispare requests
        const start = Date.now();
        while (!found && Date.now() - start < 12_000) {
            await page.waitForTimeout(250);
        }

        if (!found) return null;

        return { link: found, headers: {} };
    } finally {
        await browser.close();
    }
}