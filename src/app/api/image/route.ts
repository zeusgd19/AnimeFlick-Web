import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const urlParam = req.nextUrl.searchParams.get("url");
        
        if (!urlParam) {
            return new NextResponse("Missing url parameter", { status: 400 });
        }

        const decodedUrl = decodeURIComponent(urlParam);

        // Fetch image pretending to be a normal browser from TioAnime
        const response = await fetch(decodedUrl, {
            headers: {
                "Referer": "https://tioanime.com/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
                "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            }
        });

        if (!response.ok) {
            return new NextResponse("Image fetch failed", { status: response.status });
        }

        const buffer = await response.arrayBuffer();
        const headers = new Headers();
        
        headers.set("Content-Type", response.headers.get("Content-Type") || "image/jpeg");
        headers.set("Cache-Control", "public, max-age=31536000, immutable");

        return new NextResponse(buffer, {
            status: 200,
            headers,
        });
    } catch (e) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
