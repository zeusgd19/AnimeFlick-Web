import { fetchAnimesOnAir } from "@/lib/providers/anime";
import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const day = url.searchParams.get("day");

        // Obtenemos los animes en emision desde el proveedor configurado (TioAnime por defecto ahora)
        const data = await fetchAnimesOnAir();
        
        // Dependiendo de cómo lo devuelva el provider, extraemos la lista
        const mediaList = data?.data?.media || data?.data || [];

        // Mapeamos al formato AiringAnime que espera la app Android
        const airingAnimes = mediaList.map((a: any) => ({
            title: a.title,
            slug: a.slug,
            airingData: "On Air",
            cover: a.cover
        }));

        if (day) {
            // Si piden por dia especifico, devolvemos un array como espera Android getAiringAnimesByDay()
            return NextResponse.json(airingAnimes, {
                headers: {
                    "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=300",
                },
            });
        }

        // Si no piden dia, Android getGroupedAiringAnimes() espera un Map<String, List<AiringAnime>>
        // TioAnime no da los días en el listado de emisión, así que los ponemos todos en Lunes o Todos
        // Ponemos en "Lunes" para que al menos salgan si la UI agrupa por días reales
        const grouped = {
            "Lunes": airingAnimes,
            "Martes": [],
            "Miercoles": [],
            "Jueves": [],
            "Viernes": [],
            "Sabado": [],
            "Domingo": []
        };

        return NextResponse.json(grouped, {
            headers: {
                "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=300",
            },
        });
    } catch (e) {
        return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    }
}
