import { fetchAnimesOnAir, fetchAnimeBySlug } from "@/lib/providers/anime";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Mapa para convertir día en inglés a español
const WEEKDAY_ES: Record<number, string> = {
    0: "Domingo",
    1: "Lunes",
    2: "Martes",
    3: "Miércoles",
    4: "Jueves",
    5: "Viernes",
    6: "Sábado",
};

function getWeekdayFromDate(dateStr: string): string | null {
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return null;
        return WEEKDAY_ES[date.getDay()] ?? null;
    } catch {
        return null;
    }
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const day = url.searchParams.get("day");

        const data = await fetchAnimesOnAir();
        const mediaList = data?.data?.media || data?.data || [];

        // Para cada anime, intentamos obtener next_airing_episode en paralelo
        const withDayPromises = mediaList.map(async (a: any) => {
            const mapped = {
                title: a.title,
                slug: a.slug,
                airingData: "On Air",
                cover: a.cover,
            };

            try {
                const detail = await fetchAnimeBySlug(a.slug);
                const nextAiring = detail?.data?.next_airing_episode;
                if (nextAiring) {
                    const weekday = getWeekdayFromDate(nextAiring);
                    return { ...mapped, airingData: nextAiring, weekday };
                }
            } catch { }

            return { ...mapped, weekday: null as string | null };
        });

        const animesWithDay = await Promise.allSettled(withDayPromises);

        const resolved = animesWithDay
            .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
            .map((r) => r.value);

        if (day) {
            const filtered = resolved.filter((a) => a.weekday === day);
            const cleaned = filtered.map(({ weekday, ...rest }) => rest);
            return NextResponse.json(cleaned, {
                headers: {
                    "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=300",
                },
            });
        }

        // Agrupar por día de la semana
        const grouped: Record<string, any[]> = {
            "Lunes": [],
            "Martes": [],
            "Miércoles": [],
            "Jueves": [],
            "Viernes": [],
            "Sábado": [],
            "Domingo": [],
        };

        for (const anime of resolved) {
            const { weekday, ...rest } = anime;
            const key = weekday || "Lunes"; // Fallback a Lunes si no tiene fecha
            if (grouped[key]) {
                grouped[key].push(rest);
            } else {
                grouped[key] = [rest];
            }
        }

        return NextResponse.json(grouped, {
            headers: {
                "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=300",
            },
        });
    } catch (e) {
        return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    }
}
