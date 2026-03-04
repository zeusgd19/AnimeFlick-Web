import { chromium } from "playwright";
import {ExtractResult} from "@/app/api/extract/route";

function normalize(u: string) {
    if (!u) return u;
    if (u.startsWith("//")) return `https:${u}`;
    return u;
}

function secondsToMinutes(sec: number) {
    return sec / 60;
}

// Suma #EXTINF del playlist (sirve para VOD HLS)
function sumHlsDurationSeconds(m3u8: string): number {
    let total = 0;
    const re = /#EXTINF:([\d.]+)\s*,?/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(m3u8))) {
        total += parseFloat(m[1]);
    }
    return total;
}

async function probeDurationSeconds(
    context: import("playwright").BrowserContext,
    inputUrl: string,
    redirectedUrl: string,
    kind: "hls" | "mp4"
): Promise<number | null> {
    try {
        // 1) Si es HLS: trae m3u8 y suma EXTINF
        if (kind === "hls") {
            const resp = await context.request.get(redirectedUrl, {
                headers: {
                    Referer: inputUrl, // misma idea: referer = downLink/página
                    "User-Agent":
                        "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36",
                    Accept: "*/*",
                },
                maxRedirects: 5,
            });

            if (!resp.ok()) return null;
            const text = await resp.text();

            // si es master playlist, a veces no tiene EXTINF (solo variantes)
            // intentamos encontrar una variante y sumarla
            let seconds = sumHlsDurationSeconds(text);
            if (seconds > 0) return seconds;

            // Busca primera variante .m3u8 en el master
            const variantMatch = text.match(/^(?!#)(.+\.m3u8[^\r\n]*)/m);
            if (!variantMatch?.[1]) return null;

            const variantUrl = new URL(variantMatch[1], redirectedUrl).toString();
            const resp2 = await context.request.get(variantUrl, {
                headers: {
                    Referer: inputUrl,
                    "User-Agent":
                        "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36",
                    Accept: "*/*",
                },
            });
            if (!resp2.ok()) return null;
            const text2 = await resp2.text();
            seconds = sumHlsDurationSeconds(text2);
            return seconds > 0 ? seconds : null;
        }

        // 2) Si es MP4: usar una página temporal y leer <video>.duration
        const page = await context.newPage();
        await page.setContent(
            `<!doctype html>
<html>
  <body>
    <video id="v" preload="metadata" controls></video>
    <script>
      const v = document.getElementById('v');
      v.src = ${JSON.stringify(redirectedUrl)};
    </script>
  </body>
</html>`,
            { waitUntil: "domcontentloaded" }
        );

        // Espera a metadata
        await page.waitForFunction(() => {
            const v = document.getElementById("v") as HTMLVideoElement | null;
            return !!v && Number.isFinite(v.duration) && v.duration > 0;
        }, { timeout: 12_000 });

        const duration = await page.$eval("#v", (el) => (el as HTMLVideoElement).duration);
        await page.close();
        return typeof duration === "number" && isFinite(duration) && duration > 0 ? duration : null;
    } catch {
        return null;
    }
}

async function probeMp4SizeBytes(context: import("playwright").BrowserContext, url: string, referer: string) {
    try {
        const resp = await context.request.get(url, {
            headers: {
                Range: "bytes=0-1",
                Referer: referer,
                "User-Agent":
                    "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36",
                Accept: "*/*",
            },
            maxRedirects: 5,
        });

        const cr = resp.headers()["content-range"]; // "bytes 0-1/12345678"
        if (!cr) return null;

        const m = cr.match(/\/(\d+)\s*$/);
        if (!m?.[1]) return null;

        return Number(m[1]);
    } catch {
        return null;
    }
}

export async function extractStapeWithPlaywright(
    url: string,
    opts?: { minMinutes?: number } // por defecto 4
): Promise<ExtractResult> {
    const minMinutes = opts?.minMinutes ?? 4;

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

        // Kotlin: downLink = extractLink(url). Aquí asumimos que input ya es downLink.
        const downLink = url;

        // Kotlin: html = getHtml(downLink) y parsea video#mainvideo
        const page = await context.newPage();
        await page.goto(downLink, { waitUntil: "domcontentloaded", timeout: 45_000 });

        const rawSrc: string | null =
            (await page
                .$eval("video#mainvideo", (el) => (el as HTMLVideoElement).getAttribute("src"))
                .catch(() => null)) ??
            (await page
                .$eval("video#mainvideo source", (el) => (el as HTMLSourceElement).getAttribute("src"))
                .catch(() => null));

        if (!rawSrc) return null;

        // Kotlin: intermediateUrl = if startsWith(http) else "https:"+src
        const intermediateUrl = normalize(rawSrc);

        // Kotlin: OkHttp followRedirects(false) + request(intermediateUrl) Referer=downLink
        const resp = await context.request.get(intermediateUrl, {
            headers: {
                Referer: downLink, // ✅ igual que Kotlin
                "User-Agent":
                    "Mozilla/5.0 (Android) AppleWebKit/537.36 Chrome/114.0.0.0 Mobile Safari/537.36",
                Accept: "*/*",
            },
            maxRedirects: 0, // ✅ igual que Kotlin (no seguir redirects)
        });

        const h = resp.headers();
        const redirectedUrl = h["location"] || h["Location"];
        if (!redirectedUrl) return null;

        const finalUrl = redirectedUrl;
        const kind: "hls" | "mp4" = finalUrl.includes(".m3u8") ? "hls" : "mp4";

        if (kind === "mp4") {
            const size = await probeMp4SizeBytes(context, finalUrl, downLink);

            // ESTRICTO: si no podemos saber tamaño, descartamos
            if (!size || !Number.isFinite(size)) return null;

            // Umbral típico: un capítulo real suele ser bastante más grande que un anuncio.
            const minBytes = (1500 * 240) / 8 / 1024;
            if (size < minBytes) return null;
        }


        // ✅ Anti-anuncio por duración
        const seconds = await probeDurationSeconds(context, downLink, finalUrl, kind);
        const minutes = seconds ? secondsToMinutes(seconds) : null;

        // Si no podemos medir duración, NO lo descartamos (para no romper casos raros),
        // pero puedes decidir lo contrario.
        if (minutes === null) {
            return null;
        }
        if (minutes < minMinutes) {
            return null;
        }

        // Kotlin: headers = { Referer: redirectedUrl, Range: bytes=0- }
        return {
            provider: "stape",
            kind,
            url: finalUrl,
            headers: {
                Referer: finalUrl,
                Range: "bytes=0-",
            },
            debug: {
                intermediateUrl,
                durationSeconds: seconds,
                durationMinutes: minutes,
                minMinutes,
            },
        };
    } finally {
        await browser.close();
    }
}