import { NextRequest, NextResponse } from "next/server";
import { fetchServersEpisode } from "@/lib/providers/anime";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    
    // Android envía 'slug-numero' (ej: naruto-1)
    // Extraemos el número del final
    const match = slug.match(/^(.*)-(\d+)$/);
    
    if (!match) {
        return NextResponse.json({ success: false, message: "Invalid format. Expected 'slug-number'" }, { status: 400 });
    }

    const animeSlug = match[1];
    const episodeNumber = parseInt(match[2], 10);

    try {
        const data = await fetchServersEpisode(animeSlug, episodeNumber);
        return NextResponse.json(data, {
            status: 200,
            headers: {
                "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60",
            },
        });
    } catch (e: any) {
        return NextResponse.json(
            { success: false, message: e?.message ?? "Error" },
            { status: 500 }
        );
    }
}
