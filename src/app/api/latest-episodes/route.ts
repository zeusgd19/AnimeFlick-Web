import { NextResponse } from "next/server";
import {fetchLatestEpisodesFromExternal} from "@/lib/providers/anime";

export const revalidate = 300;

export async function GET() {
    const data = await fetchLatestEpisodesFromExternal();
    return NextResponse.json(data, {
        headers: {
            "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=60",
        },
    });
}