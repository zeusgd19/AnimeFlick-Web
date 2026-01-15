// src/app/me/all/_components/all-grid.tsx
import Link from "next/link";
import AnimeCard from "@/components/AnimeCard/anime-card";
import { Pagination } from "@/components/Pagination/pagination";
import type { FilteredAnime, ProgressAnimeResponse } from "@/types/anime";
import { fetchProgress } from "@/lib/providers/user";

type UiStatus = "watching" | "completed" | "paused";

const PAGE_SIZE = 24;

const STATUS_QUERY: Record<UiStatus, string> = {
    watching: "viendo",
    completed: "completado",
    paused: "en pausa",
};

const STATUS_LABEL: Record<UiStatus, { label: string; icon: string }> = {
    watching: { label: "Siguiendo", icon: "▶" },
    paused: { label: "En pausa", icon: "⏸" },
    completed: { label: "Completados", icon: "✓" },
};

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center rounded-full border bg-card/60 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur">
      {children}
    </span>
    );
}

function StatusPill({ status }: { status: UiStatus }) {
    const s = STATUS_LABEL[status];
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
      <span>{s.icon}</span>
      <span>{s.label}</span>
    </span>
    );
}

type ProgressItem = FilteredAnime & { __status: UiStatus };

export default async function AllGrid({ page }: { page: number }) {
    const results = await Promise.allSettled([
        fetchProgress(STATUS_QUERY.watching),
        fetchProgress(STATUS_QUERY.paused),
        fetchProgress(STATUS_QUERY.completed),
    ]);

    const [watchingRes, pausedRes, completedRes] = results;

    const toItems = (r: PromiseSettledResult<ProgressAnimeResponse>, status: UiStatus): ProgressItem[] => {
        if (r.status !== "fulfilled") return [];
        const animes = r.value?.animes ?? [];
        if (!Array.isArray(animes)) return [];
        return animes.map((a) => ({ ...a, __status: status }));
    };

    const watching = toItems(watchingRes, "watching");
    const paused = toItems(pausedRes, "paused");
    const completed = toItems(completedRes, "completed");

    const map = new Map<string, ProgressItem>();
    [...watching, ...paused, ...completed].forEach((a) => {
        const key = a.slug ?? a.title;
        if (!key) return;
        if (!map.has(key)) map.set(key, a);
    });

    const all = Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title));
    const total = all.length;

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    const items = all.slice(start, start + PAGE_SIZE);

    const paginationData = {
        currentPage: safePage,
        foundPages: totalPages,
        hasNextPage: safePage < totalPages,
    };

    return (
        <section className="rounded-3xl border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold">Tus animes</h2>
                    <p className="text-sm text-muted-foreground">
                        Mostrando {items.length} de {total} · Página {safePage}/{totalPages}
                    </p>
                </div>
                <Badge>Page size: {PAGE_SIZE}</Badge>
            </div>

            {total === 0 ? (
                <div className="mt-6 rounded-2xl border bg-card p-5">
                    <p className="text-sm font-semibold">No tienes animes en progreso todavía.</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Añade un anime a “Siguiendo / En pausa / Completado” y aparecerá aquí.
                    </p>
                    <div className="mt-4">
                        <Link
                            href="/search"
                            className="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
                        >
                            Explorar →
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {items.map((a) => (
                            <div key={a.slug ?? a.title} className="relative">
                                <div className="absolute left-2 top-2 z-10">
                                    <StatusPill status={a.__status} />
                                </div>
                                <AnimeCard anime={a} />
                            </div>
                        ))}
                    </div>

                    {/* IMPORTANTE: que el basePath sea correcto y el componente añada page */}
                    <Pagination basePath="/me/all" query={{}} data={paginationData} />
                </>
            )}
        </section>
    );
}
