import {fetchAnimesOnAir} from "@/lib/providers/anime";
import {NextResponse} from "next/server";

export const revalidate = 3600;

export async function GET() {
    const data = await fetchAnimesOnAir();
    return NextResponse.json(data, {
        headers: {
            "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=300",
        },
    });
}