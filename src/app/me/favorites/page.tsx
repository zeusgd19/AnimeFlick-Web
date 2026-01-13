import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import Link from "next/link";
import FavoritesClient from "@/components/Me/favorite-client";

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center rounded-full border bg-card/60 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur">
      {children}
    </span>
    );
}

export default function FavoritesPage() {
    return (
        <div className="min-h-dvh bg-background">
            <Header />

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
                        <span className="text-foreground">Favoritos</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <div className="flex flex-wrap gap-2">
                                <Badge>❤️ Favoritos</Badge>
                                <Badge>LocalStorage</Badge>
                            </div>

                            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                                Favoritos
                            </h1>
                            <p className="mt-2 max-w-prose text-sm text-muted-foreground">
                                Carga instantánea desde localStorage + refresco opcional desde el servidor.
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
                <FavoritesClient />
                <Footer />
            </main>
        </div>
    );
}
