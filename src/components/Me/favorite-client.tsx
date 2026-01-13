"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Pagination } from "@/components/Pagination/pagination";
import  { AnimeFavoriteCard } from "@/components/AnimeCard/anime-card";
import {
    ensureFavoritesSynced,
    getFavoriteAnimes,
    type FavoriteAnime,
} from "@/lib/utils/favorite";

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center rounded-full border bg-card/60 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur">
      {children}
    </span>
    );
}

export default function FavoritesClient() {
    const sp = useSearchParams();
    const rawPage = sp.get("page");
    const page = Math.max(1, Number(rawPage ?? 1));

    const PAGE_SIZE = 24;

    const [data, setData] = useState<FavoriteAnime[]>([]);
    const [synced, setSynced] = useState(false);

    // 1) carga instantánea desde localStorage
    useEffect(() => {
        setData(getFavoriteAnimes());
    }, []);

    // 2) refresco opcional desde server (si tienes /api/favorites)
    useEffect(() => {
        (async () => {
            await ensureFavoritesSynced(false);
            setData(getFavoriteAnimes());
            setSynced(true);
        })();
    }, []);

    const { items, paginationData, total, totalPages, safePage } = useMemo(() => {
        const all = data.slice().sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
        const total = all.length;
        const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
        const safePage = Math.min(page, totalPages);
        const start = (safePage - 1) * PAGE_SIZE;
        const items = all.slice(start, start + PAGE_SIZE);

        return {
            items,
            total,
            totalPages,
            safePage,
            paginationData: {
                currentPage: safePage,
                foundPages: totalPages,
                hasNextPage: safePage < totalPages,
            },
        };
    }, [data, page]);

    return (
        <section className="rounded-3xl border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold">Tus favoritos</h2>
                    <p className="text-sm text-muted-foreground">
                        Mostrando {items.length} de {total} · Página {safePage}/{totalPages}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Badge>Page size: {PAGE_SIZE}</Badge>
                    <Badge>{synced ? "Sync ✓" : "Sync…"}</Badge>
                </div>
            </div>

            {total === 0 ? (
                <div className="mt-6 rounded-2xl border bg-card p-5">
                    <p className="text-sm font-semibold">Aún no tienes favoritos.</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Añade animes a favoritos y aparecerán aquí.
                    </p>
                </div>
            ) : (
                <>
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {items.map((a) => (
                            <AnimeFavoriteCard key={a.slug ?? a.title} anime={a as any} />
                        ))}
                    </div>

                    <Pagination basePath="/me/favorites" query={{}} data={paginationData} />
                </>
            )}
        </section>
    );
}
