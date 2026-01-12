import Header from "@/components/Header/header";
import { fetchAnimesByFilter, fetchSearchAnime } from "@/lib/providers/anime";
import type { FilteredAnime, FilteredAnimesResponse, RealAnimeType } from "@/types/anime";
import AnimeCard from "@/components/AnimeCard/anime-card";
import { Pagination } from "@/components/Pagination/pagination";
import SearchFilters from "@/components/Search/search-filters";

type SearchParams = Record<string, string | string[] | undefined>;

const allowedTypes: RealAnimeType[] = ["tv", "movie", "special", "ova"];
const isRealAnimeType = (v: any): v is RealAnimeType => allowedTypes.includes(v);

const allowedStatuses = new Set([1, 2, 3]);

const toArray = (v: string | string[] | undefined): string[] =>
    !v ? [] : Array.isArray(v) ? v : [v];

export default async function SearchPage({
                                             searchParams,
                                         }: {
    searchParams?: Promise<SearchParams>;
}) {
    const sp = (await searchParams) ?? {};

    const query = typeof sp.q === "string" ? sp.q.trim() : "";

    const rawPage = Array.isArray(sp.page) ? sp.page[0] : sp.page;
    const page = Math.max(1, Number(rawPage ?? 1));

    // filtros desde URL (se repiten como ?type=tv&type=movie etc.)
    const types = toArray(sp.type).filter(isRealAnimeType);
    const genres = toArray(sp.genre).filter(Boolean);
    const statuses = toArray(sp.status)
        .map((s) => Number(s))
        .filter((n) => allowedStatuses.has(n));

    const hasFilters = types.length > 0 || genres.length > 0 || statuses.length > 0;
    const shouldFetch = !!query || hasFilters;

    let results: FilteredAnimesResponse | null = null;

    if (hasFilters) {
        // ✅ filtros -> by-filter
        results = await fetchAnimesByFilter({
            page,
            order: "title",
            types,
            genres,
            statuses,
        });
    } else if (query) {
        // ✅ búsqueda normal -> /search
        results = await fetchSearchAnime(query, page);
    }

    const media = results?.data?.media ?? [];
    const isEmpty = shouldFetch && media.length === 0;

    return (
        <div className="min-h-dvh bg-background">
            <Header />

            <main className="mx-auto max-w-6xl px-4 py-6">
                {/* Header búsqueda */}
                <section className="mb-4">
                    <h1 className="text-2xl font-semibold">Resultados</h1>

                    {query ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                            Buscando: <span className="font-medium text-foreground">“{query}”</span>
                            {hasFilters ? (
                                <span className="ml-2 text-xs text-muted-foreground">
                  (Nota: con filtros activos se usa el endpoint de filtros)
                </span>
                            ) : null}
                        </p>
                    ) : (
                        <p className="mt-1 text-sm text-muted-foreground">
                            Usa filtros para explorar o escribe algo para buscar.
                        </p>
                    )}
                </section>

                {/* Botón / modal filtros */}
                <SearchFilters initialTypes={types} initialGenres={genres} initialStatuses={statuses} />

                {/* Estados */}
                {!shouldFetch ? (
                    <p className="mt-6 text-sm text-muted-foreground">
                        Escribe algo en la barra de búsqueda o abre filtros para empezar.
                    </p>
                ) : null}

                {isEmpty ? (
                    <p className="mt-6 text-sm text-muted-foreground">No se han encontrado resultados 😢</p>
                ) : null}

                {/* Resultados */}
                {media.length > 0 ? (
                    <section className="mt-6">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {media.map((anime: FilteredAnime) => (
                                <AnimeCard key={anime.slug ?? anime.title} anime={anime} />
                            ))}
                        </div>

                        <Pagination
                            basePath="/search"
                            query={{
                                q: query || undefined,
                                type: types,     // arrays
                                genre: genres,   // arrays
                                status: statuses // arrays
                            }}
                            data={results!.data}
                        />
                    </section>
                ) : null}
            </main>
        </div>
    );
}
