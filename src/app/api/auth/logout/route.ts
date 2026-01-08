import { NextResponse } from "next/server";

export async function POST() {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("af_access", "", { path: "/", maxAge: 0 });
    res.cookies.set("af_refresh", "", { path: "/", maxAge: 0 });
    res.cookies.set("af_user", "", { path: "/", maxAge: 0 });
    return res;
}
