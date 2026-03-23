import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth/cookies";

const USER_API = process.env.EXTERNAL_USER_API_BASE!;

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ episodeSlug: string }> }
) {
    const p = await params;
    const { episodeSlug } = p;
    const { access } = await getAuthFromCookies();

    const headers: Record<string, string> = {};
    if (access) {
        headers["Authorization"] = `Bearer ${access}`;
    }

    try {
        const res = await fetch(`${USER_API}/comments/${episodeSlug}`, {
            headers,
            cache: "no-store",
        });

        const json = await res.json().catch(() => null);
        return NextResponse.json(json ?? { comments: [] }, { status: res.status });
    } catch (e) {
        return NextResponse.json({ comments: [] }, { status: 500 });
    }
}
