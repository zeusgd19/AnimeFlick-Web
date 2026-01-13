import Link from "next/link";
import Header from "@/components/Header/header";
import WatchPlayer from "@/components/Watch/watch-player";
import { fetchServersEpisode } from "@/lib/providers/anime";
import { parseEpisodeSlug } from "@/lib/utils/episode";
import type { ServerEpisodeResponse } from "@/types/anime";
import Footer from "@/components/Footer/footer";
import EpisodeSeenToggle from "@/components/Episode/episode-seen-toogle";
import EpisodePill from "@/components/Episode/episode-pill";

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center rounded-full border bg-card/60 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur">
      {children}
    </span>
    );
}

function ErrorState({ slug }: { slug: string }) {
    return (
        <div className="mt-6 rounded-3xl border bg-card p-6">
            <h2 className="text-lg font-semibold">No se ha podido cargar el episodio</h2>
            <p className="mt-2 text-sm text-muted-foreground">
                Puede ser un fallo temporal o un slug inválido.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
                <Link
                    href={`/watch/${slug}`}
                    className="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
                >
                    Reintentar
                </Link>
                <Link
                    href="/"
                    className="rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                    Volver al inicio
                </Link>
            </div>
        </div>
    );
}

export default async function WatchPage({
                                            params,
                                        }: {
    params: Promise<{ slug: string }> | { slug: string };
}) {
    const p = params instanceof Promise ? await params : params;
    const episodeSlug = p.slug;

    // Parse
    let animeSlug: string | null = null;
    let episodeNumber: number | null = null;

    try {
        const parsed = parseEpisodeSlug(episodeSlug);
        animeSlug = parsed.animeSlug;
        episodeNumber = parsed.number;
    } catch {
        animeSlug = null;
        episodeNumber = null;
    }

    // Fetch
    let episodeRes: ServerEpisodeResponse | null = null;
    if (animeSlug && episodeNumber) {
        try {
            episodeRes = await fetchServersEpisode(animeSlug, episodeNumber);
        } catch {
            episodeRes = null;
        }
    }

    const episode = episodeRes?.data ?? null;

    // Navigation (solo si tenemos datos)
    const prevSlug =
        animeSlug && episodeNumber ? `${animeSlug}-${Math.max(1, episodeNumber - 1)}` : null;
    const nextSlug =
        animeSlug && episodeNumber ? `${animeSlug}-${episodeNumber + 1}` : null;

    const canRenderPage = !!animeSlug && !!episodeNumber && !!episode;

    return (
        <div className="min-h-dvh bg-background">
            <Header />

            {canRenderPage ? (
                <>
                    {/* Hero */}
                    <section className="relative overflow-hidden border-b">
                        <div className="absolute inset-0">
                            <div className="h-full w-full bg-accent" />
                            <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/80 to-background" />
                            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
                        </div>

                        <div className="relative mx-auto max-w-6xl px-4 py-6">
                            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                <Link href="/" className="hover:text-foreground">
                                    Inicio
                                </Link>
                                <span>/</span>
                                <Link href={`/anime/${animeSlug}`} className="hover:text-foreground">
                                    {episode.title}
                                </Link>
                                <span>/</span>
                                <span className="text-foreground">Episodio {episode.number}</span>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                                        {episode.title}
                                    </h1>
                                    <p className="mt-1 text-sm text-muted-foreground">Episodio {episode.number}</p>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <Badge>▶ Watch</Badge>
                                        <Badge>Servers: {episode.servers?.length ?? 0}</Badge>
                                        <Badge>Slug: {episodeSlug}</Badge>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Link
                                        href={`/watch/${prevSlug!}`}
                                        className="rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
                                    >
                                        ← Anterior
                                    </Link>
                                    <Link
                                        href={`/watch/${nextSlug!}`}
                                        className="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
                                    >
                                        Siguiente →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>

                    <main className="mx-auto max-w-6xl px-4 py-8">
                        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                            <section className="space-y-6">
                                <WatchPlayer animeSlug={animeSlug!} episode={episode}/>
                            </section>

                            <aside className="lg:sticky lg:top-20 h-fit space-y-6">
                                <div className="rounded-3xl border bg-card p-6 shadow-sm">
                                    <h3 className="text-sm font-semibold">Episodio</h3>

                                    <div className="mt-4 grid gap-3">
                                        <div className="rounded-2xl border bg-card p-3">
                                            <p className="text-xs text-muted-foreground">Título</p>
                                            <p className="mt-1 text-sm font-semibold">{episode.title}</p>
                                        </div>

                                        <div className="rounded-2xl border bg-card p-3">
                                            <p className="text-xs text-muted-foreground">Número</p>
                                            <p className="mt-1 text-sm font-semibold">{episode.number}</p>
                                        </div>

                                        <div className="rounded-2xl border bg-card p-3">
                                            <p className="text-xs text-muted-foreground">Servidores</p>
                                            <p className="mt-1 text-sm font-semibold">{episode.servers?.length ?? 0}</p>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex gap-2">
                                        <Link
                                            href={`/anime/${animeSlug!}`}
                                            className="flex-1 rounded-2xl border bg-card px-4 py-2 text-center text-sm font-medium hover:bg-accent"
                                        >
                                            Detalles
                                        </Link>
                                        <Link
                                            href="/search"
                                            className="flex-1 rounded-2xl border bg-card px-4 py-2 text-center text-sm font-medium hover:bg-accent"
                                        >
                                            Buscar
                                        </Link>
                                    </div>
                                </div>
                            </aside>
                        </div>

                        <Footer />
                    </main>
                </>
            ) : (
                // ERROR UI (unificado)
                <main className="mx-auto max-w-6xl px-4 py-6">
                    {animeSlug && episodeNumber ? (
                        <>
                            <div className="text-sm text-muted-foreground">
                                <Link href="/" className="hover:text-foreground">
                                    Inicio
                                </Link>{" "}
                                <span>/</span>{" "}
                                <Link href={`/anime/${animeSlug}`} className="hover:text-foreground">
                                    Anime
                                </Link>{" "}
                                <span>/</span>{" "}
                                <span className="text-foreground">Episodio {episodeNumber}</span>
                            </div>
                            <ErrorState slug={episodeSlug} />
                        </>
                    ) : (
                        <ErrorState slug={episodeSlug} />
                    )}
                </main>
            )}
        </div>
    );
}
