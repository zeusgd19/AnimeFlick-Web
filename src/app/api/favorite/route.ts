import { NextRequest, NextResponse } from "next/server";


// ajusta el nombre de cookie si usas otro
function getAccessToken(req: NextRequest) {
    return (
        req.cookies.get("af_access")?.value ||
        req.cookies.get("accessToken")?.value ||
        req.cookies.get("token")?.value ||
        ""
    );
}

export async function GET(req: NextRequest) {
    const USER_API = process.env.EXTERNAL_USER_API_BASE!;
    const token = getAccessToken(req);
    console.log(token);
    // si no hay sesión, devuelve vacío (no rompas)
    if (!token) {
        return NextResponse.json({ data: [] }, { status: 401 });
    }

    const res = await fetch(`${USER_API}/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
        // cache 0 porque esto depende del usuario
        cache: "no-store",
    });

    const json = await res.json().catch(() => null);

    return NextResponse.json(json.favorites ?? { favroites: [] }, { status: res.status });
}

export async function POST(req: NextRequest) {
    const USER_API = process.env.EXTERNAL_USER_API_BASE!;
    const token = getAccessToken(req);
    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
        return NextResponse.json({ message: "Invalid body" }, { status: 400 });
    }

    const res = await fetch(`${USER_API}/favorites/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });

    const json = await res.json().catch(() => null);
    return NextResponse.json(json ?? { message: "Upstream error" }, { status: res.status });
}
