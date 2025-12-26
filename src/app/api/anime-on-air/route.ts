import {fetchAnimesOnAir} from "@/lib/providers/anime";
import {NextResponse} from "next/server";

export async function GET() {
    const data = await fetchAnimesOnAir();
    return NextResponse.json(data);
}