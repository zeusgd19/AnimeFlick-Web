import { NextRequest, NextResponse } from "next/server";
import { ensureFreshAccessToken } from "@/lib/auth/ensure-access";
import { getAuthFromCookies, setAuthCookies } from "@/lib/auth/cookies";
import { getCurrentUser } from "@/lib/auth/session";

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

export async function PUT(req: NextRequest) {
    const body = await req.json().catch(() => null);
    if (!body || !body.username) return NextResponse.json({ message: "Invalid body, expected { username: string }" }, { status: 400 });

    const ensured = await ensureFreshAccessToken();
    if (!ensured.access) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`${USER_API}/auth/username`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ensured.access}`,
        },
        body: JSON.stringify(body),
    });

    const json = await res.json().catch(() => null);
    let responseJson = json ?? { message: "Upstream error" };

    if (res.ok) {
        // Update the af_user cookie with new display_name
        const currentUser = await getCurrentUser();
        if (currentUser) {
            const updatedUser = {
                ...currentUser,
                display_name: body.username,
            };
            const out = NextResponse.json({ ...responseJson, user: updatedUser }, { status: res.status });
            out.cookies.set("af_user", JSON.stringify(updatedUser), {
                path: "/",
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 7, // 1 week
            });
            if (ensured.response) mergeSetCookieHeaders(ensured.response, out);
            if (res.headers.get("set-cookie")) mergeSetCookieHeaders(res, out);
            return out;
        }
    }

    const out = NextResponse.json(responseJson, { status: res.status });
    if (ensured.response) mergeSetCookieHeaders(ensured.response, out);
    if (res.headers.get("set-cookie")) mergeSetCookieHeaders(res, out);
    return out;
}
