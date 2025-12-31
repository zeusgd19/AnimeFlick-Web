// components/QuickFilters.tsx
import Link from "next/link";
import { RealAnimeType } from "@/types/anime";

const filters = [
    { type: "ova" as RealAnimeType, label: "OVAs" },
    { type: "special" as RealAnimeType, label: "Especial" },
    { type: "movie" as RealAnimeType, label: "Películas" },
    { type: "tv" as RealAnimeType, label: "Animes" },
] as const;

export default function QuickFilters({ active }: { active?: string }) {
    return (
        <section className="mt-6 flex flex-wrap gap-2">
            <Link
                href="/"
                className={`rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent ${
                    !active ? "ring-2 ring-foreground/20" : ""
                }`}
            >
                En Emision
            </Link>

            {filters.map((f) => (
                <Link
                    key={f.type}
                    href={`/?type=${f.type}`}
                    className={`rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent ${
                        active === f.type ? "ring-2 ring-foreground/20" : ""
                    }`}
                >
                    {f.label}
                </Link>
            ))}
        </section>
    );
}
