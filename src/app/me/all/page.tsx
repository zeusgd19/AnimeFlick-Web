// src/app/me/all/page.tsx
import Link from "next/link";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import { getCurrentUser } from "@/lib/auth/session";
import { Suspense } from "react";
import AllGrid from "./_components/all-grid";
import AllGridSkeleton from "./_components/all-grid-skeleton";

export const dynamic = "force-dynamic";

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center rounded-full border bg-card/60 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur">
      {children}
    </span>
    );
}

function parsePage(v: unknown) {
    const s = Array.isArray(v) ? v[0] : v;
    const n = Number(s);
    return Number.isFinite(n) && n >= 1 ? n : 1;
}

export default async function AllPage({
                                          searchParams,
                                      }: {
    searchParams?: Promise<{ page?: string | string[] }> | { page?: string | string[] };
}) {
    const user = await getCurrentUser();

    const sp = searchParams instanceof Promise ? await searchParams : searchParams;
    const page = parsePage((sp as any)?.page);

    if (!user) {
        return (
            <div className="min-h-dvh bg-background">
                <Header />
                <main className="mx-auto max-w-6xl px-4 py-10">
                    <section className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">
                        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Todos</h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Inicia sesión para ver tus listas (Siguiendo, En pausa y Completados).
                        </p>
                        <div className="mt-5 flex flex-wrap gap-2">
                            <Link
                                href="/login?next=/me/all"
                                className="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
                            >
                                Entrar →
                            </Link>
                            <Link
                                href="/me"
                                className="rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
                            >
                                Volver a Mis listas
                            </Link>
                        </div>
                    </section>
                    <Footer />
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-dvh bg-background">
            <Header />

            {/* Hero (sale instantáneo) */}
            <section className="relative overflow-hidden border-b">
                <div className="absolute inset-0">
                    <div className="h-full w-full bg-accent" />
                    <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/80 to-background" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
                </div>

                <div className="relative mx-auto max-w-6xl px-4 py-8 md:py-10">
                    <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground">Inicio</Link>
                        <span>/</span>
                        <Link href="/me" className="hover:text-foreground">Mis listas</Link>
                        <span>/</span>
                        <span className="text-foreground">Todos</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <div className="flex flex-wrap gap-2">
                                <Badge>📚 Todos</Badge>
                                <Badge>Sin favoritos</Badge>
                                <Badge>Page: {page}</Badge>
                            </div>

                            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Todos</h1>
                            <p className="mt-2 max-w-prose text-sm text-muted-foreground">
                                Aquí se juntan Siguiendo, En pausa y Completados. (Paginación local.)
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Link href="/me/following" className="rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent">
                                ▶ Siguiendo →
                            </Link>
                            <Link href="/me/paused" className="rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent">
                                ⏸ En pausa →
                            </Link>
                            <Link href="/me/completed" className="rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent">
                                ✓ Completados →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <main className="mx-auto max-w-6xl px-4 py-8">
                {/* CLAVE: key={page} fuerza suspense en cada cambio de ?page= */}
                <Suspense key={page} fallback={<AllGridSkeleton />}>
                    <AllGrid page={page} />
                </Suspense>

                <Footer />
            </main>
        </div>
    );
}
