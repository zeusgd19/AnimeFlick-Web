import {fetchAnimesOnAir} from "@/lib/providers/anime";
import {NextResponse} from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const data = (await fetchAnimesOnAir()) || { success: true, data: [] };
    return NextResponse.json(data, {
        headers: {
            "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=300",
        },
    });
}