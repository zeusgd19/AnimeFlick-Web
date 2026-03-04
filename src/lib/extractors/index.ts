import type { ExtractResult } from "@/app/api/extract/route";
import { extractStreamWishVideo } from "@/lib/streamwish-extractor";
import { extractStapeWithPlaywright } from "./stape-playwright";
import {extractStreamWishWithPlaywright} from "@/lib/streamwish-playwright";

function hostOf(u: string) {
    try {
        return new URL(u).hostname.toLowerCase();
    } catch {
        return "";
    }
}

function wrap(provider: string, link: string, headers?: Record<string, string>, debug?: any): ExtractResult {
    const kind: "hls" | "mp4" = link.includes(".m3u8") ? "hls" : "mp4";
    return { provider, kind, url: link, headers: headers ?? {}, debug };
}

export async function extractByProvider(inputUrl: string): Promise<ExtractResult> {
    const host = hostOf(inputUrl);

    // ✅ Streamwish (tu extractor actual)
    if (host.includes("streamwish")) {
        const r = await extractStreamWishWithPlaywright(inputUrl);
        if (r?.url) return wrap("streamwish", r.url, r.headers);
        return null;
    }

    // ✅ Stape / Streamtape / clones típicos
    if (
        host.includes("streamtape") ||
        host.includes("stape") ||
        host.includes("streamta") // por si hay variaciones raras
    ) {
        const r = await extractStapeWithPlaywright(inputUrl, { minMinutes: 2 });
        if (r?.url) return r;
        return null;
    }

    // 👇 Aquí puedes ir añadiendo:
    // - Netu
    // - YourUpload
    // - Filemoon / Vidhide
    // Si no hay extractor, devolver null y que lo haga el fallback universal.

    return null;
}