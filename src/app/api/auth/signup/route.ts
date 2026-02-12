import { NextResponse } from "next/server";
import { SignUpUser } from "@/lib/providers/user"; // ajusta ruta si hace falta

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Llama a tu provider (esto ocurre en servidor => sí puede leer env)
        const data = await SignUpUser(body);

        console.log(data);

        return NextResponse.json(data, { status: 200 });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err?.message ?? "Signup error" },
            { status: 500 }
        );
    }
}
