import Link from "next/link";
import SearchMobile from "@/components/Header/SearchMobile/search-mobile";

export default function Header(){
    return (
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <img src="logo_a.png" className="inline-flex h-14 w-14 items-center justify-center rounded-xl"/>
                    <p className="text-xl">AnimeFlick</p>
                </Link>

                <div className="mx-auto hidden w-full max-w-xl md:block">
                    <div className="flex items-center rounded-2xl border bg-card px-3 py-2">
                        <span className="text-muted-foreground">⌕</span>
                        <input
                            className="w-full bg-transparent px-2 text-sm outline-none"
                            placeholder="Busca anime, estudio, género…"
                        />
                    </div>
                </div>

                <nav className="ml-auto flex items-center gap-2">
                    <Link
                        href="/search"
                        className="rounded-xl border px-3 py-2 text-sm font-medium hover:bg-accent"
                    >
                        Explorar
                    </Link>
                    <Link
                        href="/me"
                        className="hidden rounded-xl border px-3 py-2 text-sm font-medium hover:bg-accent sm:inline-flex"
                    >
                        Mis listas
                    </Link>

                    <Link
                        href="/download"
                        className="hidden rounded-xl border px-3 py-2 text-sm font-medium hover:bg-accent md:inline-flex"
                    >
                        Descargar APK
                    </Link>
                    <Link
                        href="/login"
                        className="rounded-xl bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90"
                    >
                        Entrar
                    </Link>
                </nav>
            </div>

            {/* Search mobile */}
            <SearchMobile></SearchMobile>
        </header>
    )
}