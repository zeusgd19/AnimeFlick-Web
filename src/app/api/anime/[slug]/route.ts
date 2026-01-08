// src/app/api/anime/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchAnimeBySlug } from "@/lib/providers/anime"; // o tu fetch externo

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    try {
        const data = await fetchAnimeBySlug(slug);
        return NextResponse.json(data, { status: 200 });
    } catch (e: any) {
        return NextResponse.json(
            { success: false, message: e?.message ?? "Error" },
            { status: 500 }
        );
    }
}
