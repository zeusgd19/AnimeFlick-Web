import { NextRequest, NextResponse } from "next/server";
import { fetchUpstreamWith401Retry, applyAuthCookiesToResponse } from "@/lib/auth/proxy";

const USER_API = process.env.EXTERNAL_USER_API_BASE!;

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => null);
    if (!body || !body.episode_slug || !body.content) {
        return NextResponse.json({ message: "Invalid body" }, { status: 400 });
    }

    const { upstream, ensuredResponse, refreshedTokens } = await fetchUpstreamWith401Retry((token) =>
        fetch(`${USER_API}/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
            cache: "no-store",
        })
    );

    const json = await upstream.json().catch(() => null);
    const out = NextResponse.json(json ?? { message: "Upstream error" }, { status: upstream.status });

    applyAuthCookiesToResponse(out, ensuredResponse, refreshedTokens);
    return out;
}
