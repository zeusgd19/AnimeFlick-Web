// src/app/me/paused/page.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import AnimeCard from "@/components/AnimeCard/anime-card";
import { Pagination } from "@/components/Pagination/pagination";
import type {ProgressAnimeResponse} from "@/types/anime";
import {fetchProgress} from "@/lib/providers/user";
import {getProgressCached} from "@/lib/me/progress";

export const dynamic = "force-dynamic"; // user-specific (cookies) => no cache


function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center rounded-full border bg-card/60 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur">
      {children}
    </span>
    );
}

function ErrorState({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">{title}</h2>
            {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
                <Link
                    href="/me/paused"
                    className="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
                >
                    Reintentar
                </Link>
                <Link
                    href="/me"
                    className="rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                    Volver a Mis listas
                </Link>
            </div>
        </div>
    );
}

export default async function PausedPage({
                                                searchParams,
                                            }: {
    searchParams?: Promise<{ page?: string }> | { page?: string };
}) {
    const sp = searchParams instanceof Promise ? await searchParams : searchParams;
    const rawPage = sp?.page;
    const page = Math.max(1, Number(rawPage ?? 1));

    const STATUS = "en pausa";
    const PAGE_SIZE = 24;

    let data: ProgressAnimeResponse | null = null;
    let authMissing = false;

    try {
        data = await getProgressCached(STATUS);
    } catch (e: any) {
        authMissing = e?.message === "NO_AUTH";
        data = null;
    }

    return (
        <div className="min-h-dvh bg-background">
            <Header />

            {/* Hero */}
            <section className="relative overflow-hidden border-b">
                <div className="absolute inset-0">
                    <div className="h-full w-full bg-accent" />
                    <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/80 to-background" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
                </div>

                <div className="relative mx-auto max-w-6xl px-4 py-8 md:py-10">
                    <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground">
                            Inicio
                        </Link>
                        <span>/</span>
                        <Link href="/me" className="hover:text-foreground">
                            Mis listas
                        </Link>
                        <span>/</span>
                        <span className="text-foreground">En Pausa</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <div className="flex flex-wrap gap-2">
                                <Badge>▶️ En Pausa</Badge>
                                <Badge>Status: {STATUS}</Badge>
                                {data?.animes ? <Badge>Total: {data.animes.length}</Badge> : null}
                            </div>

                            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                                En Pausa
                            </h1>
                            <p className="mt-2 max-w-prose text-sm text-muted-foreground">
                                Animes que tienes en pausa ahora mismo. (Paginación local por si hay muchos.)
                            </p>
                        </div>

                        <Link
                            href="/me"
                            className="rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
                        >
                            Volver →
                        </Link>
                    </div>
                </div>
            </section>

            <main className="mx-auto max-w-6xl px-4 py-8">
                {/* No auth */}
                {authMissing ? (
                    <div className="rounded-3xl border bg-card p-6 shadow-sm">
                        <h2 className="text-lg font-semibold">Necesitas iniciar sesión</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Para ver tus listas, inicia sesión primero.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Link
                                href="/login?next=/me/paused"
                                className="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
                            >
                                Entrar →
                            </Link>
                            <Link
                                href="/"
                                className="rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
                            >
                                Volver al inicio
                            </Link>
                        </div>
                    </div>
                ) : !data ? (
                    <ErrorState
                        title="No se pudo cargar tu lista"
                        subtitle="Puede ser un fallo temporal del servidor o de tu sesión."
                    />
                ) : (
                    (() => {
                        // Paginación local
                        const all = (data.animes ?? []).slice().sort((a, b) => a.title.localeCompare(b.title));
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
                                        <h2 className="text-lg font-semibold">Lista: En Pausa</h2>
                                        <p className="text-sm text-muted-foreground">
                                            Mostrando {items.length} de {total} · Página {safePage}/{totalPages}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Badge>Page size: {PAGE_SIZE}</Badge>
                                        {data.message ? <Badge>{data.message}</Badge> : null}
                                    </div>
                                </div>

                                {total === 0 ? (
                                    <div className="mt-6 rounded-2xl border bg-card p-5">
                                        <p className="text-sm font-semibold">Aún no tienes animes en “En Pausa”.</p>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            Explora animes y añádelos a tu lista cuando implementes la lógica.
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
                                                <AnimeCard key={a.slug ?? a.title} anime={a} />
                                            ))}
                                        </div>

                                        <Pagination basePath="/me/paused" query={{}} data={paginationData} />
                                    </>
                                )}
                            </section>
                        );
                    })()
                )}

                <Footer />
            </main>
        </div>
    );
}
