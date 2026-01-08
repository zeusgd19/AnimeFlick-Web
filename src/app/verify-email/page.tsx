import Link from "next/link";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center rounded-full border bg-card/60 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur">
      {children}
    </span>
    );
}

export default async function VerifyEmailPage({
                                                  searchParams,
                                              }: {
    searchParams?: Promise<{ email?: string }> | { email?: string };
}) {
    const sp = searchParams instanceof Promise ? await searchParams : searchParams;
    const email = sp?.email ?? "";

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
                                <Badge>📩 Verificación</Badge>
                                <Badge>Cuenta</Badge>
                            </div>
                            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                                Revisa tu correo
                            </h1>
                            <p className="mt-2 max-w-prose text-sm text-muted-foreground">
                                Te hemos enviado un email con un enlace para verificar tu cuenta.
                            </p>
                        </div>

                        <Link
                            href="/login"
                            className="rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
                        >
                            Ir a Login →
                        </Link>
                    </div>
                </div>
            </section>

            <main className="mx-auto max-w-6xl px-4 py-10">
                <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                    {/* Main card */}
                    <section className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">
                        <div className="flex items-end justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold">Correo enviado</h2>
                                <p className="text-sm text-muted-foreground">
                                    {email ? (
                                        <>
                                            Se ha enviado un correo de verificación a{" "}
                                            <span className="font-medium text-foreground">{email}</span>.
                                        </>
                                    ) : (
                                        <>
                                            Se ha enviado un correo de verificación a tu dirección de email.
                                        </>
                                    )}
                                </p>
                            </div>

                            <Link
                                href="/"
                                className="text-sm font-medium text-muted-foreground hover:text-foreground"
                            >
                                Inicio
                            </Link>
                        </div>

                        <div className="mt-6 grid gap-3">
                            <div className="rounded-2xl border bg-card p-4">
                                <p className="text-sm font-medium">Pasos</p>
                                <ol className="mt-2 grid gap-2 text-sm text-muted-foreground">
                                    <li>1) Abre tu bandeja de entrada</li>
                                    <li>2) Busca “AnimeFlick – Verifica tu cuenta”</li>
                                    <li>3) Haz click en el enlace del email</li>
                                </ol>
                            </div>

                            <div className="rounded-2xl border bg-card p-4">
                                <p className="text-sm font-medium">¿No lo ves?</p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Mira también en <span className="font-medium">Spam</span> o{" "}
                                    <span className="font-medium">Promociones</span>. A veces tarda 1–2 minutos.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="mt-2 flex flex-wrap gap-2">
                                <Link
                                    href="/login"
                                    className="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
                                >
                                    Ya lo he verificado → Entrar
                                </Link>

                                {/* Botón dummy */}
                                <button
                                    type="button"
                                    className="rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
                                    title="Demo: aquí luego harás la lógica de reenvío"
                                >
                                    Reenviar email
                                </button>

                                <Link
                                    href="/register"
                                    className="rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
                                >
                                    Cambiar email
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Side info */}
                    <aside className="lg:sticky lg:top-20 h-fit space-y-6">
                        <section className="rounded-3xl border bg-card p-6 shadow-sm">
                            <h3 className="text-sm font-semibold">Ayuda rápida</h3>
                            <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                                <li className="rounded-2xl border bg-card p-3">
                                    ✓ Añade tu email a contactos si no llega
                                </li>
                                <li className="rounded-2xl border bg-card p-3">
                                    ✓ Revisa filtros/automáticos (Gmail, Outlook)
                                </li>
                                <li className="rounded-2xl border bg-card p-3">
                                    ✓ Prueba reenviar pasados 60s
                                </li>
                            </ul>
                        </section>

                        <section className="rounded-3xl border bg-card p-6 shadow-sm">
                            <h3 className="text-sm font-semibold">Estado</h3>
                            <div className="mt-3 grid gap-2">
                                <div className="rounded-2xl border bg-card p-3">
                                    <p className="text-xs text-muted-foreground">Verificación</p>
                                    <p className="mt-1 text-sm font-semibold">Pendiente</p>
                                </div>
                                <div className="rounded-2xl border bg-card p-3">
                                    <p className="text-xs text-muted-foreground">Consejo</p>
                                    <p className="mt-1 text-sm">
                                        Puedes implementar aquí un “Comprobar verificación” (polling) más adelante.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </aside>
                </div>

                <Footer />
            </main>
        </div>
    );
}
