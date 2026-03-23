import { NextRequest, NextResponse } from "next/server";
import { fetchUpstreamWith401Retry, applyAuthCookiesToResponse } from "@/lib/auth/proxy";

const USER_API = process.env.EXTERNAL_USER_API_BASE!;

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ commentId: string }> }
) {
    const p = await params;
    const commentId = p.commentId;

    const { upstream, ensuredResponse, refreshedTokens } = await fetchUpstreamWith401Retry((token) =>
        fetch(`${USER_API}/comments/${commentId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        })
    );

    const json = await upstream.json().catch(() => null);
    const out = NextResponse.json(json ?? { message: "Upstream error" }, { status: upstream.status });

    applyAuthCookiesToResponse(out, ensuredResponse, refreshedTokens);
    return out;
}
