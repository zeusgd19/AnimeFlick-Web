// src/app/me/page.tsx
import Link from "next/link";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import { getCurrentUser } from "@/lib/auth/session"; // si aún no lo tienes, crea este helper como te pasé antes

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center rounded-full border bg-card/60 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur">
      {children}
    </span>
    );
}

function ListCard({
                      title,
                      description,
                      href,
                      meta,
                  }: {
    title: string;
    description: string;
    href: string;
    meta?: string;
}) {
    return (
        <Link
            href={href}
            prefetch
            className="group rounded-3xl border bg-card p-5 shadow-sm transition hover:bg-accent hover:shadow-md"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-base font-semibold tracking-tight">{title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>

                    {meta ? (
                        <p className="mt-3 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground/80">Incluye:</span> {meta}
                        </p>
                    ) : null}
                </div>

                <span className="shrink-0 text-muted-foreground transition group-hover:text-foreground">
          →
        </span>
            </div>
        </Link>
    );
}

export default async function MePage() {
    const user = await getCurrentUser();

    // Si no hay sesión
    if (!user) {
        return (
            <div className="min-h-dvh bg-background">
                <Header />
                <main className="mx-auto max-w-6xl px-4 py-10">
                    <section className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                                    Tus listas
                                </h1>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Inicia sesión para ver y gestionar tus animes.
                                </p>
                            </div>

                            <Link
                                href="/login?next=/me"
                                className="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
                            >
                                Entrar →
                            </Link>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border bg-card p-4">
                                <p className="text-sm font-semibold">Qué podrás hacer</p>
                                <ul className="mt-2 grid gap-2 text-sm text-muted-foreground">
                                    <li>✓ Marcar episodios como vistos</li>
                                    <li>✓ Guardar animes en listas</li>
                                    <li>✓ Reanudar donde lo dejaste</li>
                                </ul>
                            </div>
                            <div className="rounded-2xl border bg-card p-4">
                                <p className="text-sm font-semibold">Tip</p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Puedes usar <span className="font-medium text-foreground/80">next=/me</span> para volver aquí
                                    justo después del login.
                                </p>
                            </div>
                            <div className="rounded-2xl border bg-card p-4 sm:col-span-2">
                                <p className="text-sm font-semibold">Favoritos sin cuenta</p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Puedes ver tus favoritos guardados en local aunque no hayas iniciado sesión.
                                </p>
                                <Link
                                    href="/me/favorites"
                                    className="mt-3 inline-flex rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
                                >
                                    Ver Favoritos →
                                </Link>
                            </div>
                        </div>
                    </section>
                    <Footer />
                </main>
            </div>
        );
    }

    // Cards de listas (rutas sugeridas)
    const lists = [
        {
            title: "📚 Todos",
            description:
                "Ver todo lo que tienes en progreso o terminado (sin favoritos).",
            href: "/me/all",
            meta: "Completados · Siguiendo · En pausa",
        },
        {
            title: "❤️ Favoritos",
            description: "Tus animes favoritos, guardados aparte.",
            href: "/me/favorites",
        },
        {
            title: "✅ Completados",
            description: "Todo lo que ya has terminado.",
            href: "/me/completed",
        },
        {
            title: "▶️ Siguiendo",
            description: "Lo que estás viendo ahora mismo.",
            href: "/me/following",
        },
        {
            title: "⏸️ En pausa",
            description: "Animes que has dejado para más tarde.",
            href: "/me/paused",
        },
    ] as const;

    const displayName = user.display_name ?? user.email ?? "Usuario";

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

                <div className="relative mx-auto max-w-6xl px-4 py-10">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <div className="flex flex-wrap gap-2">
                                <Badge>👤 {displayName}</Badge>
                                <Badge>📌 Mis listas</Badge>
                            </div>

                            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                                Tus listas
                            </h1>

                            <p className="mt-2 max-w-prose text-sm text-muted-foreground">
                                Accede rápido a tus animes por estado. (De momento es UI; luego conectas la lógica.)
                            </p>
                        </div>

                        <Link
                            href="/search"
                            className="rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
                        >
                            Explorar animes →
                        </Link>
                    </div>
                </div>
            </section>

            <main className="mx-auto max-w-6xl px-4 py-10">
                <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                    {/* LEFT */}
                    <section className="space-y-6">
                        <div className="rounded-3xl border bg-card p-6 shadow-sm">
                            <div className="flex items-end justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-semibold">Listas</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Entra a una lista para ver sus animes.
                                    </p>
                                </div>

                                <Badge>Demo UI</Badge>
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                {lists.map((l) => (
                                    <ListCard
                                        key={l.href}
                                        title={l.title}
                                        description={l.description}
                                        href={l.href}
                                        meta={"meta" in l ? (l as any).meta : undefined}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Bloque extra opcional */}
                        <div className="rounded-3xl border bg-card p-6 shadow-sm">
                            <h3 className="text-sm font-semibold">Acciones rápidas</h3>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <Link
                                    href="/me/all"
                                    className="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
                                >
                                    Ver “Todos”
                                </Link>
                                <Link
                                    href="/me/following"
                                    className="rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
                                >
                                    Seguir viendo →
                                </Link>
                            </div>
                            <p className="mt-3 text-sm text-muted-foreground">
                                Aquí luego puedes poner “Último visto” o “Continuar episodio”.
                            </p>
                        </div>
                    </section>

                    {/* RIGHT */}
                    <aside className="lg:sticky lg:top-20 h-fit space-y-6">
                        <div className="rounded-3xl border bg-card p-6 shadow-sm">
                            <h3 className="text-sm font-semibold">Resumen</h3>

                            <div className="mt-4 grid gap-3">
                                <div className="rounded-2xl border bg-card p-3">
                                    <p className="text-xs text-muted-foreground">Usuario</p>
                                    <p className="mt-1 text-sm font-semibold">{displayName}</p>
                                </div>

                                <div className="rounded-2xl border bg-card p-3">
                                    <p className="text-xs text-muted-foreground">Email</p>
                                    <p className="mt-1 text-sm font-semibold">
                                        {user.email ?? "—"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border bg-card p-6 shadow-sm">
                            <h3 className="text-sm font-semibold">Atajos</h3>
                            <div className="mt-3 grid gap-2">
                                <Link
                                    href="/me/favorites"
                                    className="rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
                                >
                                    Ir a Favoritos →
                                </Link>
                                <Link
                                    href="/me/completed"
                                    className="rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
                                >
                                    Ir a Completados →
                                </Link>
                            </div>
                        </div>
                    </aside>
                </div>

                <Footer />
            </main>
        </div>
    );
}
