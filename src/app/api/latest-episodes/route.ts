import { NextResponse } from "next/server";
import {fetchLatestEpisodesFromExternal} from "@/lib/providers/anime";

export const revalidate = 300;

export async function GET() {
    const data = await fetchLatestEpisodesFromExternal();
    return NextResponse.json(data);
}