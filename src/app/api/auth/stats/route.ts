import { NextRequest, NextResponse } from "next/server";
import { ensureFreshAccessToken } from "@/lib/auth/ensure-access";
import { getAuthFromCookies, setAuthCookies } from "@/lib/auth/cookies";

const USER_API = process.env.EXTERNAL_USER_API_BASE!;

function mergeSetCookieHeaders(from: Response, to: NextResponse) {
    const anyHeaders = from.headers as any;
    const list: string[] | undefined = anyHeaders.getSetCookie?.();
    if (Array.isArray(list) && list.length) {
        for (const c of list) to.headers.append("set-cookie", c);
        return;
    }
    const sc = from.headers.get("set-cookie");
    if (sc) to.headers.append("set-cookie", sc);
}

export async function GET(req: NextRequest) {
    const ensured = await ensureFreshAccessToken();
    if (!ensured.access) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`${USER_API}/auth/stats`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${ensured.access}`,
        },
    });

    const json = await res.json().catch(() => null);
    const out = NextResponse.json(json ?? { message: "Upstream error" }, { status: res.status });

    if (ensured.response) mergeSetCookieHeaders(ensured.response, out);
    if (res.headers.get("set-cookie")) mergeSetCookieHeaders(res, out);

    return out;
}
