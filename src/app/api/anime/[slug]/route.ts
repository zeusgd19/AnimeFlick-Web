import {NextResponse} from "next/server";
import {fetchAnimeBySlug} from "@/lib/providers/anime";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
    try {
        const data = await fetchAnimeBySlug(params.slug);
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    }
}