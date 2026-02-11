// src/app/register/page.tsx
import Link from "next/link";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import RegisterForm from "@/components/Auth/register-form";

function Field({
                   label,
                   type = "text",
                   placeholder,
                   name,
                   autoComplete,
               }: {
    label: string;
    type?: string;
    placeholder?: string;
    name: string;
    autoComplete?: string;
}) {
    return (
        <label className="grid gap-2">
            <span className="text-sm font-medium">{label}</span>
            <input
                name={name}
                type={type}
                placeholder={placeholder}
                autoComplete={autoComplete}
                className="h-11 w-full rounded-2xl border bg-card px-4 text-sm outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10"
            />
        </label>
    );
}

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center rounded-full border bg-card/60 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur">
      {children}
    </span>
    );
}

export default function RegisterPage() {
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
                                <Badge>✨ Cuenta nueva</Badge>
                                <Badge>AnimeFlick</Badge>
                            </div>
                            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                                Crea tu cuenta
                            </h1>
                            <p className="mt-2 max-w-prose text-sm text-muted-foreground">
                                En 1 minuto tendrás listas, progreso y recomendaciones básicas.
                            </p>
                        </div>

                        <Link
                            href="/login"
                            className="rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
                        >
                            Ya tengo cuenta →
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
                                <h2 className="text-lg font-semibold">Empecemos</h2>
                                <p className="text-sm text-muted-foreground">
                                    Crea tu usuario para sincronizar tu progreso.
                                </p>
                            </div>

                            <Link
                                href="/"
                                className="text-sm font-medium text-muted-foreground hover:text-foreground"
                            >
                                Volver al inicio
                            </Link>
                        </div>

                        <RegisterForm></RegisterForm>
                    </section>

                    {/* Side info */}
                    <aside className="lg:sticky lg:top-20 h-fit space-y-6">
                        <section className="rounded-3xl border bg-card p-6 shadow-sm">
                            <h3 className="text-sm font-semibold">Incluye</h3>
                            <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                                <li className="rounded-2xl border bg-card p-3">✓ Guardar “Visto” por episodio</li>
                                <li className="rounded-2xl border bg-card p-3">✓ Listas y favoritos</li>
                                <li className="rounded-2xl border bg-card p-3">✓ Sincronización entre dispositivos</li>
                            </ul>
                        </section>
                    </aside>
                </div>

                <Footer />
            </main>
        </div>
    );
}
