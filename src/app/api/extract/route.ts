import { NextResponse } from "next/server";
import { extractByProvider } from "@/lib/extractors";
import { extractWithPlaywrightCapture } from "@/lib/extractors/playwright-capture";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type ExtractResult =
    | {
    provider: string;
    kind: "hls" | "mp4";
    url: string;
    headers?: Record<string, string>;
    debug?: any;
}
    | null;

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as { url?: string };
        const url = body?.url?.trim();

        if (!url) {
            return NextResponse.json({ ok: false, error: "Missing url" }, { status: 400 });
        }

        // 1) intentamos extractor específico (ligero / o playwright específico)
        let result: ExtractResult = await extractByProvider(url);

        // 2) fallback universal: captura por red (m3u8 o mp4)
        if (!result) {
            result = await extractWithPlaywrightCapture(url);
        }

        return NextResponse.json({ ok: true, result }, { status: 200 });
    } catch (e: any) {
        console.error("[/api/extract] error:", e?.message ?? e);
        return NextResponse.json(
            { ok: false, error: e?.message ?? "Server error" },
            { status: 500 }
        );
    }
}