// src/app/anime/[slug]/page.tsx
import Link from "next/link";
import Header from "@/components/Header/header";
import { fetchAnimeBySlug, fetchBannerFromAniListByTitle } from "@/lib/providers/anime";
import type { AnimeResponse, Episode, RelatedAnime } from "@/types/anime";
import Footer from "@/components/Footer/footer";
import EpisodePill from "@/components/Episode/episode-pill";
import AddToProgressMenu from "@/components/Me/add-to-progress-menu";
import AddToFavorite from "@/components/Me/add-to-favorite";

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center rounded-full border bg-card/60 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur">
      {children}
    </span>
    );
}

function Stat({
                  label,
                  value,
              }: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border bg-card p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-semibold">{value}</p>
        </div>
    );
}

function RelatedCard({ r }: { r: RelatedAnime }) {
    return (
        <Link
            href={`/anime/${r.slug}`}
            className="group rounded-2xl border bg-card p-4 hover:bg-accent"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-semibold">{r.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{r.relation}</p>
                </div>
                <span className="text-muted-foreground group-hover:text-foreground">→</span>
            </div>
        </Link>
    );
}

export default async function AnimeDetailPage({
                                                  params,
                                              }: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const animeResponse: AnimeResponse = await fetchAnimeBySlug(slug);
    const anime = animeResponse.data;

    // Banner por título real (mejor matching que por slug)
    const anilist = await fetchBannerFromAniListByTitle(anime.title);
    const banner = anilist?.banner ?? anilist?.cover ?? anime.cover;

    const altTitles = (anime.alternative_titles ?? []).filter(Boolean);
    const genres = (anime.genres ?? []).filter(Boolean);
    const episodes = (anime.episodes ?? []).slice().sort((a, b) => a.number - b.number);
    const related = (anime.related ?? []).filter(Boolean);

    return (
        <div className="min-h-dvh bg-background">
            <Header />

            {/* HERO */}
            <section className="relative overflow-hidden border-b">
                {/* Banner background */}
                <div className="absolute inset-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={banner}
                        alt={anime.title}
                        className="h-full w-full object-cover opacity-35"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/80 to-background" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
                </div>

                <div className="relative mx-auto max-w-6xl px-4 py-8 md:py-10">
                    {/* Breadcrumb */}
                    <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground">Inicio</Link>
                        <span>/</span>
                        <Link href="/search" className="hover:text-foreground">Anime</Link>
                        <span>/</span>
                        <span className="text-foreground">{anime.title}</span>
                    </div>

                    {/* Header row */}
                    <div className="grid gap-6 md:grid-cols-[180px_1fr]">
                        {/* Floating cover */}
                        <div className="w-[180px]">
                            <div className="relative">
                                <div className="absolute -inset-2 rounded-3xl bg-foreground/10 blur-xl" />
                                <div className="relative overflow-hidden rounded-3xl border bg-card shadow-sm">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={anime.cover}
                                        alt={anime.title}
                                        className="block w-full h-auto object-contain bg-black/5"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Title + chips */}
                        <div className="flex flex-col justify-center">
                            <div className="flex flex-wrap gap-2">
                                <Badge>{anime.type}</Badge>
                                <Badge>{anime.status}</Badge>
                                <Badge>⭐ {anime.rating}</Badge>
                                {anime.next_airing_episode ? <Badge>⏭ {anime.next_airing_episode}</Badge> : null}
                            </div>

                            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                                {anime.title}
                            </h1>

                            {altTitles.length ? (
                                <p className="mt-2 text-sm text-muted-foreground">
                                    <span className="text-foreground/80 font-medium">Alternativos:</span>{" "}
                                    {altTitles.slice(0, 4).join(" · ")}
                                    {altTitles.length > 4 ? " · …" : ""}
                                </p>
                            ) : null}

                            {/* Primary actions */}
                            <div className="mt-5 flex flex-wrap gap-2">
                                <AddToProgressMenu
                                    anime={{
                                        anime_slug: slug,
                                        title: anime.title,
                                        cover: anime.cover,
                                        rating: anime.rating,
                                        type: String(anime.type),
                                    }}
                                    triggerClassName="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
                                />

                                <AddToFavorite anime={{
                                    slug: slug,
                                    title: anime.title,
                                    cover: anime.cover,
                                    rating: anime.rating,
                                    type: String(anime.type),
                                }}
                                ></AddToFavorite>

                                <a
                                    href={anime.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
                                >
                                    Abrir fuente ↗
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CONTENT */}
            <main className="mx-auto max-w-6xl px-4 py-8">
                <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                    {/* LEFT: Overview + Episodes + Related */}
                    <div className="space-y-6">
                        {/* Overview card */}
                        <section className="rounded-3xl border bg-card p-6 shadow-sm">
                            <div className="flex items-end justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-semibold">Sinopsis</h2>
                                    <p className="text-sm text-muted-foreground">Información del anime</p>
                                </div>

                                <Link
                                    href={`/watch/${episodes[0]?.slug ?? slug}`}
                                    className="rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
                                >
                                    Ver ahora →
                                </Link>
                            </div>

                            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                                {anime.synopsis}
                            </p>

                            {/* Genres */}
                            {genres.length ? (
                                <div className="mt-5 flex flex-wrap gap-2">
                                    {genres.map((g) => (
                                        <Link
                                            key={g}
                                            href={`/search?genre=${encodeURIComponent(g)}`}
                                            className="rounded-2xl border bg-card px-3 py-2 text-sm font-medium hover:bg-accent"
                                        >
                                            {g}
                                        </Link>
                                    ))}
                                </div>
                            ) : null}
                        </section>

                        {/* Episodes card with internal scroll */}
                        <section className="rounded-3xl border bg-card p-6 shadow-sm">
                            <div className="flex flex-wrap items-end justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-semibold">Episodios</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Scroll solo aquí (no en toda la página)
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <Badge>{episodes.length} total</Badge>
                                    <button
                                        type="button"
                                        className="rounded-2xl border bg-card px-3 py-2 text-sm font-medium hover:bg-accent"
                                        title="Demo"
                                    >
                                        Orden ↑ (demo)
                                    </button>
                                </div>
                            </div>

                            {/* Scroll container */}
                            <div className="mt-4 max-h-[520px] overflow-y-auto pr-2 overscroll-contain">
                                <div className="grid gap-2">
                                    {episodes.map((ep) => (
                                        <EpisodePill key={ep.number} ep={ep} />
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Related */}
                        {related.length ? (
                            <section className="rounded-3xl border bg-card p-6 shadow-sm">
                                <div>
                                    <h2 className="text-lg font-semibold">Relacionado</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Secuelas, precuelas y similares
                                    </p>
                                </div>

                                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                    {related.map((r) => (
                                        <RelatedCard key={`${r.slug}-${r.relation}`} r={r} />
                                    ))}
                                </div>
                            </section>
                        ) : null}
                    </div>

                    {/* RIGHT: Sticky sidebar */}
                    <aside className="lg:sticky lg:top-20 h-fit space-y-6">
                        <section className="rounded-3xl border bg-card p-6 shadow-sm">
                            <h3 className="text-sm font-semibold">Detalles</h3>
                            <div className="mt-4 grid gap-3">
                                <Stat label="Tipo" value={anime.type} />
                                <Stat label="Estado" value={anime.status} />
                                <Stat label="Rating" value={`⭐ ${anime.rating}`} />
                                <Stat label="Episodios" value={episodes.length} />
                                {anime.next_airing_episode ? (
                                    <Stat label="Próximo episodio" value={anime.next_airing_episode} />
                                ) : null}
                            </div>
                        </section>

                        <section className="rounded-3xl border bg-card p-6 shadow-sm">
                            <h3 className="text-sm font-semibold">Acciones</h3>
                            <div className="mt-3 grid gap-2">
                                <AddToProgressMenu
                                    anime={{
                                        anime_slug: slug,
                                        title: anime.title,
                                        cover: anime.cover,
                                        rating: anime.rating,
                                        type: String(anime.type),
                                    }}
                                    triggerClassName="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
                                />
                                <Link
                                    href={`/watch/${episodes[0]?.slug ?? slug}`}
                                    className="rounded-2xl border bg-card px-4 py-2 text-center text-sm font-medium hover:bg-accent"
                                >
                                    Empezar desde el 1
                                </Link>
                            </div>
                        </section>
                    </aside>
                </div>

                {/* Footer */}
                <Footer></Footer>
            </main>
        </div>
    );
}

