import { NextResponse } from "next/server";
import { extractByProvider } from "@/lib/extractors";
import { extractWithPlaywrightCapture } from "@/lib/extractors/playwright-capture";
import {detectProvider} from "@/lib/extractors/provider";

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
        const { url } = (await req.json()) as { url?: string };
        if (!url) {
            return NextResponse.json({ ok: false, error: "Missing url" }, { status: 400 });
        }

        const provider = detectProvider(url);

        // ✅ 1) Provider conocido => NO fallback genérico (evita anuncios)
        if (provider !== "unknown") {
            const result = await extractByProvider(url);
            console.log(result)
            if (!result) {
                return NextResponse.json(
                    { ok: false, error: "Vídeo no encontrado o eliminado (o detectado como anuncio)" },
                    { status: 404 }
                );
            }
            return NextResponse.json({ ok: true, result }, { status: 200 });
        }

        // ✅ 2) Unknown => fallback genérico
        let result = await extractByProvider(url);
        if (!result) result = await extractWithPlaywrightCapture(url, { minMinutes: 2 });

        if (!result) {
            return NextResponse.json(
                { ok: false, error: "Vídeo no encontrado o eliminado" },
                { status: 404 }
            );
        }

        return NextResponse.json({ ok: true, result }, { status: 200 });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
    }
}