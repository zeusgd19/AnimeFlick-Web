import { mergeSeenEpisodes } from "@/lib/utils/episode";


export async function primeWatchedEpisodes() {
    try {
        // Si usas cookies httpOnly, /api/watched las leerá automáticamente.
        const res = await fetch("/api/watched", { method: "GET", cache: "no-store" });
        if (!res.ok) return;

        const slugs = await res.json();
        // fusiona con localStorage (seenEpisodes)
        mergeSeenEpisodes(slugs);
    } catch {
        // si falla, no rompas login
    }
}
