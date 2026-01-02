import Header from "@/components/Header/header";
import Link from "next/link";
import { fetchSearchAnime } from "@/lib/providers/anime";
import {FilteredAnime, FilteredAnimesResponse} from "@/types/anime";
import {Pagination} from "@/components/Pagination/pagination";
import AnimeCard from "@/components/AnimeCard/anime-card";

type SearchPageProps = {
    searchParams?: {
        q?: string;
        page?: number;
    };
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const sp = await searchParams;
    const query = sp?.q?.trim();
    const page = sp?.page

    const results: FilteredAnimesResponse = query
        ? await fetchSearchAnime(query, page)
        : null;

    console.log(results);
    return (
        <div className="min-h-dvh bg-background">
            <Header />

            <main className="mx-auto max-w-6xl px-4 py-6">
                {/* Header búsqueda */}
                <section className="mb-6">
                    <h1 className="text-2xl font-semibold">
                        Resultados de búsqueda
                    </h1>
                    {query && (
                        <p className="mt-1 text-sm text-muted-foreground">
                            Buscando: <span className="font-medium text-foreground">“{query}”</span>
                        </p>
                    )}
                </section>

                {/* Estados */}
                {!query && (
                    <p className="text-sm text-muted-foreground">
                        Escribe algo en la barra de búsqueda para empezar.
                    </p>
                )}

                {query && results?.data?.media?.length === 0 || results == null && (
                    <p className="text-sm text-muted-foreground">
                        No se han encontrado resultados 😢
                    </p>
                )}

                {/* Resultados */}
                {query && results?.data?.media?.length > 0 && (
                    <section>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {results.data.media.map((anime: FilteredAnime) => {
                                return (
                                    <AnimeCard key={anime.title} anime={anime} />
                                );
                            })}
                        </div>

                        <Pagination basePath="/search" query={{q:query}} data={results.data}></Pagination>
                    </section>
                )}
            </main>
        </div>
    );
}
