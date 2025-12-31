import {NextResponse} from "next/server";
import {fetchAnimesByFilter} from "@/lib/providers/anime";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const type = body?.type;

        if (!type) {
            return NextResponse.json({ error: "Missing 'type'" }, { status: 400 });
        }

        const data = await fetchAnimesByFilter(type);
        return NextResponse.json(data);
    } catch (e) {
        return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    }
}