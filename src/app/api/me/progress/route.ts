import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import type { ProgressAddWrapper, ProgressBody, ProgressStatus } from "@/types/progress";

const allowed: ProgressStatus[] = ["watching", "completed", "paused", "none"];
const isStatus = (v: any): v is ProgressStatus => allowed.includes(v);

export async function POST(req: Request) {
    const body = (await req.json()) as Partial<ProgressBody>;

    // Validación mínima
    if (
        !body ||
        typeof body.anime_slug !== "string" ||
        typeof body.title !== "string" ||
        typeof body.cover !== "string" ||
        typeof body.rating !== "string" ||
        typeof body.type !== "string" ||
        !isStatus(body.status)
    ) {
        return NextResponse.json(
            { success: false, message: "Bad body" },
            { status: 400 }
        );
    }

    const base = process.env.EXTERNAL_USER_API_BASE;
    if (!base) {
        return NextResponse.json(
            { success: false, message: "Missing EXTERNAL_USER_API_BASE" },
            { status: 500 }
        );
    }

    const store = await cookies();
    const token = store.get("af_access")?.value;

    const userRaw = store.get("af_user")?.value;
    const userId = userRaw ? JSON.parse(userRaw)?.id : null;

    if (!token || !userId) {
        return NextResponse.json({ success: false, message: "NO_AUTH" }, { status: 401 });
    }

    // ⚠️ Ajusta el endpoint si en tu backend es otro,
    // pero por lo que has dicho suele ser POST a "anime/progress"
    const r = await fetch(`${base}/anime/progress`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!r.ok) {
        const t = await r.text().catch(() => "");
        return NextResponse.json(
            { success: false, message: t || `Progress API error ${r.status}` },
            { status: r.status }
        );
    }

    const json = (await r.json()) as ProgressAddWrapper;

    // ✅ Next 16 requiere segundo argumento
    revalidateTag(`progress:${userId}`, "max");
    revalidateTag(`progress:${userId}:${body.status}`, "max");

    return NextResponse.json({ success: true, data: json }, { status: 200 });
}
