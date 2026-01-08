import { NextResponse } from "next/server";
import type { SignInResponse } from "@/types/user";

export async function POST(req: Request) {
    const body = await req.json();
    const base = process.env.EXTERNAL_USER_API_BASE!;
    const r = await fetch(`${base}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
    });

    const data: SignInResponse = await r.json();
    if (!r.ok || !data.access_token || !data.user) {
        return NextResponse.json(
            { success: false, message: data?.status ?? "Invalid credentials" },
            { status: 401 }
        );
    }

    const res = NextResponse.json({ success: true, user: data.user }, { status: 200 });
    const isProd = process.env.NODE_ENV === "production";

    res.cookies.set("af_access", data.access_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: data.expires_in ? Number(data.expires_in) : 60 * 60,
    });

    if (data.refresh_token) {
        res.cookies.set("af_refresh", data.refresh_token, {
            httpOnly: true,
            secure: isProd,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
        });
    }

    // ✅ Cookie “user UI” (NO la uses para permisos, solo para pintar UI)
    const uiUser = {
        id: data.user.id,
        email: data.user.email ?? null,
        display_name:
            data.user.display_name ?? data.user.user_metadata?.display_name ?? null,
    };

    res.cookies.set("af_user", JSON.stringify(uiUser), {
        httpOnly: true, // más seguro (no lo puede tocar JS)
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
    });

    return res;
}
