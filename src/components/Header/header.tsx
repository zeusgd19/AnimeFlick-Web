"use client";
import Link from "next/link";
import SearchMobile from "@/components/Header/SearchMobile/search-mobile";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {useAuth} from "@/context/auth-context";

export default function Header(){
    const router = useRouter();
    const [query, setQuery] = useState("");
    const {user, logout} = useAuth();

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== "Enter") return;

        const q = query.trim();
        if (!q) return;

        router.push(`/search?q=${encodeURIComponent(q)}`);
    };

    return (
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <img src="/logo_a.png" className="inline-flex h-14 w-14 items-center justify-center rounded-xl"/>
                    <p className="text-xl">AnimeFlick</p>
                </Link>

                <div className="mx-auto hidden w-full max-w-xl md:block">
                    <div className="flex items-center rounded-2xl border bg-card px-3 py-2">
                        <span className="text-muted-foreground">⌕</span>
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
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
                    {user ? (
                        <Link
                            href="/me"
                            className="hidden rounded-xl border px-3 py-2 text-sm font-medium hover:bg-accent sm:inline-flex"
                        >
                            Mis listas
                        </Link>
                    ): null}
                    {!user ? (
                        <Link
                            href="/login"
                            className="rounded-xl bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90"
                        >
                            Entrar
                        </Link>
                    ) : (
                        <button
                            type="button"
                            onClick={async () => {
                                await logout();
                                router.refresh(); // para que Server Components/layout pillen el cambio
                            }}
                            className="rounded-xl border px-3 py-2 text-sm font-medium hover:bg-accent"
                            title={user.email ?? ""}
                        >
                            Salir
                        </button>
                    )}
                </nav>
            </div>

            {/* Search mobile */}
            <SearchMobile></SearchMobile>
        </header>
    )
}