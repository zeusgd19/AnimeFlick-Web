import Link from "next/link";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";

export default function NotFound() {
    return (
        <div className="min-h-dvh bg-background">
            <Header />

            <main className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-20 text-center">
                {/* Animated 404 number */}
                <div className="relative select-none">
                    <h1
                        className="text-[10rem] font-black leading-none tracking-tighter text-foreground/5 md:text-[14rem]"
                    >
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl md:text-8xl font-bold bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent animate-pulse">
                            404
                        </span>
                    </div>
                </div>

                {/* Message */}
                <div className="mt-6 space-y-3">
                    <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                        Página no encontrada
                    </h2>
                    <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
                        Lo sentimos, la página que buscas no existe o ha sido eliminada.
                        Puede que el anime o episodio que intentas ver no esté disponible.
                    </p>
                </div>

                {/* Decorative divider */}
                <div className="my-8 h-px w-48 bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <Link
                        href="/"
                        className="rounded-2xl bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
                    >
                        ← Volver al inicio
                    </Link>
                    <Link
                        href="/search"
                        className="rounded-2xl border bg-card px-6 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                    >
                        Buscar anime
                    </Link>
                </div>

                {/* Helpful tips */}
                <div className="mt-12 w-full max-w-lg">
                    <div className="rounded-3xl border bg-card/50 p-6 text-left shadow-sm backdrop-blur">
                        <h3 className="text-sm font-semibold">¿Qué puedes hacer?</h3>
                        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <span className="mt-0.5 text-purple-400">•</span>
                                <span>Comprueba que la URL sea correcta</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-0.5 text-pink-400">•</span>
                                <span>Usa el buscador para encontrar el anime que deseas</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-0.5 text-red-400">•</span>
                                <span>Vuelve a la página principal y navega desde ahí</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <Footer />
            </main>
        </div>
    );
}
