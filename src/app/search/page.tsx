import Header from "@/components/Header/header";
import Link from "next/link";
import { fetchSearchAnime } from "@/lib/providers/anime";
import { slugifyTitle } from "@/app/page";
import {FilteredAnime, FilteredAnimesResponse} from "@/types/anime";
import {Pagination} from "@/components/Pagination/pagination";

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

                {query && results.data.media.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        No se han encontrado resultados 😢
                    </p>
                )}

                {/* Resultados */}
                {query && results.data.media.length > 0 && (
                    <section>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {results.data.media.map((anime: FilteredAnime) => {
                                const slug = anime.slug ?? slugifyTitle(anime.title);

                                return (
                                    <div
                                        key={slug}
                                        className="group rounded-2xl border bg-card overflow-hidden shadow-sm transition hover:shadow-md"
                                    >
                                        <div className="relative overflow-hidden">
                                            <img
                                                src={anime.cover}
                                                alt={anime.title}
                                                className="block w-full h-auto object-contain bg-black/5 transition duration-300 group-hover:scale-[1.01]"
                                            />

                                            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                                                <h3 className="line-clamp-2 text-sm font-semibold text-white">
                                                    {anime.title}
                                                </h3>
                                            </div>

                                            <div className="absolute inset-x-3 bottom-14 hidden gap-2 group-hover:flex">
                                                <Link
                                                    href={`/anime/${slug}`}
                                                    className="flex-1 rounded-xl bg-white/90 px-3 py-2 text-center text-sm font-medium text-black backdrop-blur hover:bg-white"
                                                >
                                                    Detalles
                                                </Link>
                                                <button
                                                    className="rounded-xl bg-black/70 px-3 py-2 text-sm font-medium text-white backdrop-blur hover:bg-black/80"
                                                >
                                                    + Lista
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <Pagination basePath="/search" query={{page}} data={results.data}></Pagination>
                    </section>
                )}
            </main>
        </div>
    );
}
