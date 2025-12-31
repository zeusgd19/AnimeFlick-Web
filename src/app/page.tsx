// app/page.tsx
import Link from "next/link";
import Header from "@/components/Header/header";
import {
    fetchAnimeBySlug,
    fetchAnimesByFilter,
    fetchAnimesOnAir,
    fetchLatestEpisodesFromExternal
} from "@/lib/providers/anime";
import {
    Anime,
    AnimeOnAir,
    AnimeOnAirComplete,
    AnimeRecentEpisodeResponse, AnimeResponse,
    AnimesOnAirResponse, FilteredAnime, FilteredAnimesResponse, RealAnimeType,
    RecentEpisode
} from "@/types/anime";
import QuickFilters from "@/components/Filters/quick-filters";
import {Pagination} from "@/components/Pagination/pagination";


const genres = [
    "Acción",
    "Aventura",
    "Comedia",
    "Drama",
    "Fantasía",
    "Romance",
    "Sci-Fi",
    "Slice of Life",
    "Thriller",
    "Sobrenatural",
];

function Badge({children}: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
      {children}
    </span>
    );
}

function AnimeCardOnAir({anime}: { anime: AnimeOnAirComplete }) {
    return (
        <div className="group rounded-2xl border bg-card overflow-hidden shadow-sm transition hover:shadow-md">
            {/* Imagen + overlays */}
            <div className="relative overflow-hidden">
                <img
                    src={anime.cover}
                    alt={anime.anime.title}
                    className="block w-full h-auto object-contain bg-black/5 transition duration-300 group-hover:scale-[1.01]"
                />

                {/* Título sobre la imagen */}
                <div
                    className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                    <h3 className="line-clamp-2 text-sm font-semibold text-white">
                        {anime.anime.title}
                    </h3>
                </div>

                {/* Hover actions (encima del título) */}
                <div className="absolute inset-x-3 bottom-14 hidden gap-2 group-hover:flex">
                    <Link
                        href={`/anime/${anime.anime.slug}`}
                        className="flex-1 rounded-xl bg-white/90 px-3 py-2 text-center text-sm font_toggle:font-medium text-black backdrop-blur hover:bg-white"
                    >
                        Detalles
                    </Link>
                    <button
                        className="rounded-xl bg-black/70 px-3 py-2 text-sm font-medium text-white backdrop-blur hover:bg-black/80"
                        type="button"
                    >
                        + Lista
                    </button>
                </div>
            </div>
        </div>
    );
}

export function slugifyTitle(title: string): string {
    return title
        .toLowerCase()
        .normalize("NFD")                    // separa acentos
        .replace(/[\u0300-\u036f]/g, "")     // quita acentos
        .replace(/(\d)\.(\d)/g, "$1$2")      // 2.5 -> 25
        .replace(/(\d)-(?=[a-z])/g, "$1")    // 25-jigen -> 25jigen
        .replace(/[^\p{L}\p{N}]+/gu, "-")    // cualquier cosa rara -> "-"
        .replace(/-+/g, "-")                 // colapsa ---
        .replace(/^-+|-+$/g, "");            // recorta - al inicio/fin
}

function AnimeCardFiltered({anime}: { anime: FilteredAnime }) {
    const slug = slugifyTitle(anime.title);
    return (
        <div className="group rounded-2xl border bg-card overflow-hidden shadow-sm transition hover:shadow-md">
            {/* Imagen + overlays */}
            <div className="relative overflow-hidden">
                <img
                    src={anime.cover}
                    alt={anime.title}
                    className="block w-full h-auto object-contain bg-black/5 transition duration-300 group-hover:scale-[1.01]"
                />

                {/* Título sobre la imagen */}
                <div
                    className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                    <h3 className="line-clamp-2 text-sm font-semibold text-white">
                        {anime.title}
                    </h3>
                </div>

                {/* Hover actions (encima del título) */}
                <div className="absolute inset-x-3 bottom-14 hidden gap-2 group-hover:flex">
                    <Link
                        href={`/anime/${slug}`}
                        className="flex-1 rounded-xl bg-white/90 px-3 py-2 text-center text-sm font_toggle:font-medium text-black backdrop-blur hover:bg-white"
                    >
                        Detalles
                    </Link>
                    <button
                        className="rounded-xl bg-black/70 px-3 py-2 text-sm font-medium text-white backdrop-blur hover:bg-black/80"
                        type="button"
                    >
                        + Lista
                    </button>
                </div>
            </div>
        </div>
    );
}

function AnimeCard({anime}: { anime: RecentEpisode }) {
    return (
        <div className="group rounded-2xl border bg-card overflow-hidden shadow-sm transition hover:shadow-md">
            {/* Imagen + overlays */}
            <div className="relative overflow-hidden">
                <img
                    src={anime.cover}
                    alt={anime.title}
                    className="block w-full h-auto object-contain bg-black/5 transition duration-300 group-hover:scale-[1.01]"
                />

                {/* Título sobre la imagen */}
                <div
                    className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                    <h3 className="line-clamp-2 text-sm font-semibold text-white">
                        {anime.title}
                    </h3>
                </div>

                {/* Hover actions (encima del título) */}
                <div className="absolute inset-x-3 bottom-14 hidden gap-2 group-hover:flex">
                    <Link
                        href={`/watch/${anime.slug}`}
                        className="flex-1 rounded-xl bg-white/90 px-3 py-2 text-center text-sm font_toggle:font-medium text-black backdrop-blur hover:bg-white"
                    >
                        Ver
                    </Link>
                    <button
                        className="rounded-xl bg-black/70 px-3 py-2 text-sm font-medium text-white backdrop-blur hover:bg-black/80"
                        type="button"
                    >
                        Visto
                    </button>
                </div>
            </div>

            {/* Info extra debajo (opcional) */}
            <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                    {typeof anime.number === "number" ? (
                        <span className="text-xs text-muted-foreground">Episodio {anime.number}</span>
                    ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                    )}
                </div>
            </div>
        </div>
    );
}


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

const allowedTypes: RealAnimeType[] = ["ova", "special", "movie", "tv"];
const isRealAnimeType = (v: any): v is RealAnimeType => allowedTypes.includes(v);

export default async function HomePage({searchParams}: {
    searchParams?: { type?: RealAnimeType, page?: number };
}) {

    const res = await searchParams;
    const type = res?.type
    const rawPage = res?.page

    const page = Math.max(1, Number(rawPage ?? 1));

    const typeValid = !!type && isRealAnimeType(type);

    console.log(type);

    const filtered = typeValid ? await fetchAnimesByFilter(type, page) : null;

    console.log(filtered)

    const latestEpisodes = !typeValid ? await fetchLatestEpisodesFromExternal() : null;
    const animesOnAirResponse = await fetchAnimesOnAir();

    const animes: AnimeOnAirComplete[] = animesOnAirResponse
        ? await Promise.all(
            animesOnAirResponse.data.map(async (animeOnAir: AnimeOnAir) => {
                const anime: AnimeResponse = await fetchAnimeBySlug(animeOnAir.slug);
                return { anime: animeOnAir, cover: anime.data.cover };
            })
        )
        : [];


    return (
        <div className="min-h-dvh bg-background">
            {/* Header */}
            <Header></Header>

            <main className="mx-auto max-w-6xl px-4 py-6">
                {/* Hero */}
                <section className="relative overflow-hidden rounded-3xl border bg-card">
                    <div className="absolute inset-0">
                        {/* Imagen de fondo */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={"hola"}
                            alt={"hola"}
                            className="h-full w-full object-cover blur-[1px] opacity-30"
                        />
                        <div
                            className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/30"/>
                    </div>

                    <div className="relative grid gap-6 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-10">
                        <div className="flex flex-col justify-center">
                            <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                  Destacado
                </span>
                                <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
                  Trending
                </span>
                            </div>

                            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                                Si
                            </h1>
                            <p className="mt-3 max-w-prose text-sm text-muted-foreground">
                                Descubre lo más visto, sigue tu progreso y guarda tus animes en listas.
                                (Aquí irá una sinopsis corta cuando lo conectes a tu API.)
                            </p>

                            <div className="mt-5 flex flex-wrap gap-2">
                                <Link
                                    href={`/anime/1`}
                                    className="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
                                >
                                    Ver detalles
                                </Link>
                                <button
                                    type="button"
                                    className="rounded-2xl border px-4 py-2 text-sm font-medium hover:bg-accent"
                                >
                                    + Añadir a lista
                                </button>
                            </div>
                        </div>

                        <div className="mx-auto w-full max-w-[260px] md:mx-0 md:ml-auto">
                            <AnimeCardOnAir anime={animes[1]}/>
                        </div>
                    </div>
                </section>

                {/* Quick filters */}
                <QuickFilters active={type}></QuickFilters>

                {typeValid ? (
                    <>
                        <section className="mt-10">
                            <SectionHeader title={type?.toUpperCase()} href="/search?sort=trending"/>
                            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
                                {filtered.data.media.map((a: FilteredAnime) => (
                                    <AnimeCardFiltered key={a.title} anime={a}/>
                                ))}
                            </div>

                            <Pagination
                                basePath="/"
                                query={{ type }}
                                data={filtered.data}
                            />
                        </section>
                    </>
                ):(
                    <>
                        <section className="mt-10">
                            <SectionHeader title="Episodios Recientes" href="/search?sort=trending"/>
                            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                {latestEpisodes.data.map((a: RecentEpisode) => (
                                <AnimeCard key={a.slug} anime={a}/>))}
                            </div>
                        </section>

                        <section className="mt-10">
                            <SectionHeader title="En emisión" href="/search?filter=airing"/>
                            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                {animes.map((a) => (
                                    <AnimeCardOnAir key={a.anime.slug} anime={a}/>
                                ))}
                            </div>
                        </section>
                    </>
                )}


                {/* Géneros */}
                <section className="mt-10">
                    <SectionHeader title="Explorar por géneros" href="/search" actionLabel="Abrir búsqueda"/>
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
                        {genres.map((g) => (
                            <Link
                                key={g}
                                href={`/search?genre=${encodeURIComponent(g)}`}
                                className="rounded-2xl border bg-card px-4 py-3 text-sm font-medium hover:bg-accent"
                            >
                                {g}
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <footer className="mt-14 border-t py-8 text-sm text-muted-foreground">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p>© {new Date().getFullYear()} AnimeFlick</p>
                        <div className="flex gap-4">
                            <Link href="/legal" className="hover:text-foreground">Legal</Link>
                            <Link href="/privacy" className="hover:text-foreground">Privacidad</Link>
                            <Link href="/about" className="hover:text-foreground">Acerca de</Link>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
