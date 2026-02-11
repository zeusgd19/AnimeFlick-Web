// src/app/login/page.tsx
import Link from "next/link";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import LoginForm from "@/components/Auth/login-form";


function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center rounded-full border bg-card/60 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur">
      {children}
    </span>
    );
}

export default function LoginPage() {
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
                                <Badge>🔐 Acceso</Badge>
                                <Badge>AnimeFlick</Badge>
                            </div>
                            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                                Inicia sesión
                            </h1>
                            <p className="mt-2 max-w-prose text-sm text-muted-foreground">
                                Guarda tu progreso, marca episodios como vistos y crea tus listas.
                            </p>
                        </div>

                        <Link
                            href="/register"
                            className="rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
                        >
                            Crear cuenta →
                        </Link>
                    </div>
                </div>
            </section>

            <main className="mx-auto max-w-6xl px-4 py-10">
                <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                    {/* Form */}
                    <section className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">
                        <div className="flex items-end justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold">Bienvenido de vuelta</h2>
                                <p className="text-sm text-muted-foreground">
                                    Usa tu email y contraseña para entrar.
                                </p>
                            </div>

                            <Link
                                href="/"
                                className="text-sm font-medium text-muted-foreground hover:text-foreground"
                            >
                                Volver al inicio
                            </Link>
                        </div>

                        <LoginForm></LoginForm>
                    </section>

                    {/* Side info */}
                    <aside className="lg:sticky lg:top-20 h-fit space-y-6">
                        <section className="rounded-3xl border bg-card p-6 shadow-sm">
                            <h3 className="text-sm font-semibold">¿Qué ganas al entrar?</h3>
                            <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                                <li className="rounded-2xl border bg-card p-3">✓ Progreso por episodio</li>
                                <li className="rounded-2xl border bg-card p-3">✓ Listas: viendo / pendiente / favorito</li>
                                <li className="rounded-2xl border bg-card p-3">✓ Reanudar donde lo dejaste</li>
                            </ul>
                        </section>
                    </aside>
                </div>

                <Footer />
            </main>
        </div>
    );
}
