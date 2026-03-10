// src/app/[slug]/page.tsx
import Link from "next/link";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import { getCurrentUser } from "@/lib/auth/session";
import UserSettings from "@/components/User/UserSettings";
import ProfileStats from "@/components/Profile/ProfileStats";

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
    const joinedDate = currentUser?.created_at
        ? new Date(currentUser.created_at).toLocaleDateString('es-ES')
        : "2023-01-01";

    const user = {
        username: currentUser?.display_name || '',
        displayName: currentUser?.display_name || '',
        email: isOwnProfile ? currentUser.email : "privado",
        joined: joinedDate,
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
                        <ProfileStats />

                        {/* Settings for own profile */}
                        {isOwnProfile && (
                            <>
                                <UserSettings currentEmail={currentUser?.email || ''} currentUsername={currentUser?.display_name || ''} />

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
