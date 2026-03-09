// src/app/[slug]/page.tsx
import Link from "next/link";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import { getCurrentUser } from "@/lib/auth/session";

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

export default async function ProfilePage({
                                              params,
                                          }: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const currentUser = await getCurrentUser();

    // Placeholder: assume if slug matches current user, show settings
    const isOwnProfile = currentUser && (
        currentUser.display_name === slug ||
        currentUser.email?.split("@")[0] === slug ||
        currentUser.id === slug
    );

    // Placeholder data
    const user = {
        username: slug,
        displayName: slug,
        email: isOwnProfile ? currentUser.email : "privado",
        joined: "2023-01-01",
        stats: {
            animesWatched: 150,
            episodesWatched: 2500,
            favorites: 25,
        }
    };

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
                        <span className="text-foreground">Perfil: {user.displayName}</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <div className="flex flex-wrap gap-2">
                                <Badge>👤 Perfil</Badge>
                                <Badge>Usuario</Badge>
                            </div>

                            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                                {user.displayName}
                            </h1>
                            <p className="mt-2 max-w-prose text-sm text-muted-foreground">
                                Miembro desde {user.joined}. Le gusta ver anime y gestionar listas.
                            </p>
                        </div>

                        {isOwnProfile && (
                            <div className="flex flex-wrap gap-2">
                                <Link
                                    href="/me"
                                    className="rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
                                >
                                    Mis listas
                                </Link>
                                <Link
                                    href="/"
                                    className="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
                                >
                                    Explorar
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <main className="mx-auto max-w-6xl px-4 py-8">
                <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                    {/* LEFT: Profile content */}
                    <div className="space-y-6">
                        {/* Stats */}
                        <section className="rounded-3xl border bg-card p-6 shadow-sm">
                            <h2 className="text-lg font-semibold">Estadísticas</h2>
                            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                                <Stat label="Animes vistos" value={user.stats.animesWatched} />
                                <Stat label="Episodios vistos" value={user.stats.episodesWatched} />
                                <Stat label="Favoritos" value={user.stats.favorites} />
                            </div>
                        </section>

                        {/* Recent Activity Placeholder */}
                        <section className="rounded-3xl border bg-card p-6 shadow-sm">
                            <h2 className="text-lg font-semibold">Actividad reciente</h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Últimos animes vistos o listas actualizadas.
                            </p>
                            <div className="mt-4 space-y-3">
                                <div className="rounded-2xl border bg-card p-3">
                                    <p className="text-sm">Vio el episodio 12 de "One Piece"</p>
                                    <p className="text-xs text-muted-foreground">Hace 2 días</p>
                                </div>
                                <div className="rounded-2xl border bg-card p-3">
                                    <p className="text-sm">Añadió "Naruto" a favoritos</p>
                                    <p className="text-xs text-muted-foreground">Hace 1 semana</p>
                                </div>
                            </div>
                        </section>

                        {/* Settings for own profile */}
                        {isOwnProfile && (
                            <>
                                {/* Change Password */}
                                <section className="rounded-3xl border bg-card p-6 shadow-sm">
                                    <h2 className="text-lg font-semibold">Cambiar contraseña</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Actualiza tu contraseña para mantener tu cuenta segura.
                                    </p>

                                    <form className="mt-4 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium">Contraseña actual</label>
                                            <input
                                                type="password"
                                                className="mt-1 block w-full rounded-2xl border bg-card px-3 py-2 text-sm"
                                                placeholder="Ingresa tu contraseña actual"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Nueva contraseña</label>
                                            <input
                                                type="password"
                                                className="mt-1 block w-full rounded-2xl border bg-card px-3 py-2 text-sm"
                                                placeholder="Ingresa una nueva contraseña"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium">Confirmar nueva contraseña</label>
                                            <input
                                                type="password"
                                                className="mt-1 block w-full rounded-2xl border bg-card px-3 py-2 text-sm"
                                                placeholder="Confirma la nueva contraseña"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
                                        >
                                            Cambiar contraseña
                                        </button>
                                    </form>
                                </section>

                                {/* Change Email */}
                                <section className="rounded-3xl border bg-card p-6 shadow-sm">
                                    <h2 className="text-lg font-semibold">Cambiar email</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Actualiza tu dirección de email. Recibirás un enlace de verificación.
                                    </p>

                                    <form className="mt-4 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium">Nuevo email</label>
                                            <input
                                                type="email"
                                                className="mt-1 block w-full rounded-2xl border bg-card px-3 py-2 text-sm"
                                                placeholder="Ingresa tu nuevo email"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
                                        >
                                            Cambiar email
                                        </button>
                                    </form>
                                </section>

                                {/* Delete Account */}
                                <section className="rounded-3xl border bg-card p-6 shadow-sm">
                                    <h2 className="text-lg font-semibold text-red-600">Eliminar cuenta</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Esta acción es permanente. Todos tus datos serán eliminados.
                                    </p>

                                    <form className="mt-4 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium">Confirma tu contraseña</label>
                                            <input
                                                type="password"
                                                className="mt-1 block w-full rounded-2xl border bg-card px-3 py-2 text-sm"
                                                placeholder="Ingresa tu contraseña para confirmar"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                                        >
                                            Eliminar cuenta
                                        </button>
                                    </form>
                                </section>
                            </>
                        )}
                    </div>

                    {/* RIGHT: Sidebar */}
                    <aside className="lg:sticky lg:top-20 h-fit space-y-6">
                        <section className="rounded-3xl border bg-card p-6 shadow-sm">
                            <h3 className="text-sm font-semibold">Información</h3>
                            <div className="mt-4 grid gap-3">
                                <Stat label="Usuario" value={user.username} />
                                <Stat label="Email" value={user.email} />
                                <Stat label="Miembro desde" value={user.joined} />
                            </div>
                        </section>

                        {isOwnProfile && (
                            <section className="rounded-3xl border bg-card p-6 shadow-sm">
                                <h3 className="text-sm font-semibold">Navegación</h3>
                                <div className="mt-3 grid gap-2">
                                    <Link
                                        href="/me"
                                        className="rounded-2xl border bg-card px-4 py-2 text-center text-sm font-medium hover:bg-accent"
                                    >
                                        Mis listas
                                    </Link>
                                    <Link
                                        href="/"
                                        className="rounded-2xl border bg-card px-4 py-2 text-center text-sm font-medium hover:bg-accent"
                                    >
                                        Volver al inicio
                                    </Link>
                                </div>
                            </section>
                        )}
                    </aside>
                </div>

                <Footer />
            </main>
        </div>
    );
}
