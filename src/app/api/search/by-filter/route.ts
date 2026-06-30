import { NextResponse } from "next/server";
import { fetchAnimesByFilter } from "@/lib/providers/anime";
import { Anime } from "@/types/anime";

export async function POST(req: Request) {
    try {
        const url = new URL(req.url);
        const order = url.searchParams.get("order") || "default";
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const body = await req.json();

        // Si viene body.type, usamos ese (legado), si no, pasamos el body como AnimeFilterParams
        const filterParams = body?.type ? body.type : {
            types: body.types || [],
            genres: body.genres || [],
            statuses: body.statuses || [],
            page: page,
            order: order
        };

        const data = await fetchAnimesByFilter(filterParams);

        const media = data?.data?.media || data?.media;

        const animeModified = media.find((anime: Anime) => anime.title === "Kakkou no Iinazuke");

        if (animeModified) {
            animeModified.title = "Gayola mi cuco";
        }

        return NextResponse.json(data, {
            headers: {
                "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60",
            },
        });
    } catch (e) {
        return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    }
}