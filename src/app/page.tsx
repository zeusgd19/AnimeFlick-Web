// src/app/page.tsx
import Link from "next/link";
import Header from "@/components/Header/header";
import {
    fetchAnimesByFilter,
    fetchAnimesOnAir,
    fetchLatestEpisodesFromExternal,
} from "@/lib/providers/anime";
import type {
    AnimeOnAir,
    AnimeOnAirComplete,
    FilteredAnime,
    RealAnimeType,
    RecentEpisode,
} from "@/types/anime";
import QuickFilters from "@/components/Filters/quick-filters";
import { Pagination } from "@/components/Pagination/pagination";
import AnimeCard from "@/components/AnimeCard/anime-card";
import Footer from "@/components/Footer/footer";
import Hero from "@/components/Home/Hero";

const genres = [
    {key: "accion", label: "Acción"},
    {key: "artes-marciales", label: "Artes marciales"},
    {key: "aventura", label: "Aventura"},
    {key: "carreras", label: "Carreras"},
    {key: "ciencia-ficcion", label: "Ciencia Ficción"},
    {key: "comedia", label: "Comedia"},
    {key: "demencia", label: "Demencia"},
    {key: "demonios", label: "Demonios"},
    {key: "deportes", label: "Deportes"},
    {key: "ecchi", label: "Ecchi"}
];

function SectionHeader({
                           title,
                           href,
                           actionLabel = "Ver todo",
                       }: {
    title: string;
    href?: string;
    actionLabel?: string;
}) {
    return (
        <div className="flex items-end justify-between gap-3">
            <div>
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="text-sm text-muted-foreground">Actualizado con lo último disponible</p>
            </div>
            {href ? (
                <Link href={href} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    {actionLabel} →
                </Link>
            ) : null}
        </div>
    );
}

function ErrorState({
                        title = "No se ha podido cargar",
                        description = "Puede ser un fallo temporal. Prueba a recargar.",
                        actionHref,
                        actionLabel = "Reintentar",
                    }: {
    title?: string;
    description?: string;
    actionHref?: string;
    actionLabel?: string;
}) {
    return (
        <div className="mt-4 rounded-3xl border bg-card p-6">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>

            <div className="mt-4 flex flex-wrap gap-2">
                {actionHref ? (
                    <Link
                        href={actionHref}
                        className="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
                    >
                        {actionLabel}
                    </Link>
                ) : null}

                <Link href="/" className="rounded-2xl border px-4 py-2 text-sm font-medium hover:bg-accent">
                    Volver al inicio
                </Link>
            </div>
        </div>
    );
}

function EmptyState({
                        title = "Sin resultados",
                        description = "Prueba con otro filtro o cambia la búsqueda.",
                    }: {
    title?: string;
    description?: string;
}) {
    return (
        <div className="mt-4 rounded-3xl border bg-card p-6">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

const allowedTypes: RealAnimeType[] = ["ova", "special", "movie", "tv"];
const isRealAnimeType = (v: any): v is RealAnimeType => allowedTypes.includes(v);

type FilteredResponse = {
    success: boolean;
    data: {
        currentPage: number;
        hasNextPage: boolean;
        previousPage: string | null;
        nextPage: string | null;
        foundPages: number;
        media: FilteredAnime[];
    };
};

type LatestEpisodesResponse = {
    success: boolean;
    data: RecentEpisode[];
};

type OnAirResponse = {
    success: boolean;
    data: AnimeOnAir[];
};

export default async function HomePage({
                                           searchParams,
                                       }: {
    searchParams: Promise<{ type?: RealAnimeType; page?: number | string }>;
}) {
    // ✅ Next 15: searchParams es Promise
    const res = await searchParams;

    const type = res?.type;
    const rawPage = res?.page;

    const page = Math.max(1, Number(rawPage ?? 1));
    const typeValid = !!type && isRealAnimeType(type);

    // ✅ fetches tolerantes
    const filtered: FilteredResponse | null = typeValid ? await fetchAnimesByFilter(type, page) : null;
    const latestEpisodes: LatestEpisodesResponse | null = !typeValid ? await fetchLatestEpisodesFromExternal() : null;
    const animesOnAirResponse: OnAirResponse | null = !typeValid ? await fetchAnimesOnAir() : null;

    // ✅ construir covers directamente desde los datos on-air (ya incluyen cover)
    const animes: AnimeOnAirComplete[] =
        animesOnAirResponse?.data?.length
            ? animesOnAirResponse.data.map((animeOnAir: AnimeOnAir) => ({
                anime: animeOnAir,
                cover: animeOnAir.cover || ""
            }))
            : [];

    return (
        <div className="min-h-dvh bg-background">
            <Header />

            <main className="mx-auto max-w-6xl px-4 py-6">
                {/* Hero */}
                <Hero animes={animes} />

                {/* Quick filters */}
                <QuickFilters active={type} />

                {/* CONTENT */}
                {typeValid ? (
                    <>
                        <section className="mt-10">
                            <SectionHeader title={type.toUpperCase()} href="/search?sort=trending" />

                            {/* Error state */}
                            {!filtered ? (
                                <ErrorState
                                    title="No se han podido cargar los animes del filtro"
                                    description="Puede ser un fallo temporal de la API."
                                    actionHref={`/?type=${type}&page=${page}`}
                                />
                            ) : filtered.data.media.length === 0 ? (
                                <EmptyState title="Sin resultados" description="No hay animes para este filtro ahora mismo." />
                            ) : (
                                <>
                                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
                                        {filtered.data.media.map((a: FilteredAnime) => (
                                            <AnimeCard key={a.slug ?? a.title} anime={a} />
                                        ))}
                                    </div>

                                    <Pagination basePath="/" query={{ type }} data={filtered.data} />
                                </>
                            )}
                        </section>
                    </>
                ) : (
                    <>
                        {/* Recientes */}
                        <section className="mt-10">
                            <SectionHeader title="Episodios Recientes" href="/search?sort=trending" />

                            {!latestEpisodes ? (
                                <ErrorState
                                    title="No se han podido cargar los episodios recientes"
                                    description="Puede ser un fallo temporal. Prueba a recargar."
                                    actionHref="/"
                                />
                            ) : latestEpisodes.data.length === 0 ? (
                                <EmptyState title="Sin episodios" description="No hay episodios recientes disponibles." />
                            ) : (
                                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                    {latestEpisodes.data.map((a: RecentEpisode) => (
                                        <AnimeCard key={a.slug} anime={a} />
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* En emisión */}
                        <section className="mt-10">
                            <SectionHeader title="En emisión" href="/search?filter=airing" />

                            {!animesOnAirResponse ? (
                                <ErrorState
                                    title="No se han podido cargar los animes en emisión"
                                    description="Puede ser un fallo temporal. Prueba a recargar."
                                    actionHref="/"
                                />
                            ) : animes.length === 0 ? (
                                <EmptyState title="Sin datos" description="No hay animes en emisión disponibles ahora mismo." />
                            ) : (
                                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                    {animes.map((a) => (
                                        <AnimeCard key={a.anime.slug} anime={a} />
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}

                {/* Géneros */}
                <section className="mt-10">
                    <SectionHeader title="Explorar por géneros" href="/search" actionLabel="Abrir búsqueda" />
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
                        {genres.map((g) => (
                            <Link
                                key={g.key}
                                href={`/search?genre=${encodeURIComponent(g.key)}`}
                                className="rounded-2xl border bg-card px-4 py-3 text-sm font-medium hover:bg-accent"
                            >
                                {g.label}
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <Footer></Footer>
            </main>
        </div>
    );
}
