import { NextRequest, NextResponse } from "next/server";
import { fetchSearchAnime } from "@/lib/providers/anime";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const page = parseInt(searchParams.get("page") || "1", 10);

    if (!query) {
        return NextResponse.json(
            { success: false, message: "Missing query parameter" },
            { status: 400 }
        );
    }

    try {
        const data = await fetchSearchAnime(query, page);
        return NextResponse.json(data, {
            status: 200,
            headers: {
                "Cache-Control": "public, max-age=600, s-maxage=600, stale-while-revalidate=60",
            },
        });
    } catch (e: any) {
        return NextResponse.json(
            { success: false, message: e?.message ?? "Error" },
            { status: 500 }
        );
    }
}
