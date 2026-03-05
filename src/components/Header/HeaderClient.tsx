"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import SearchMobile from "@/components/SearchInput/SearchMobile/search-mobile";
import SearchInput from "@/components/SearchInput/search-input";
import LogoutAndLoginButton from "@/components/Auth/logout-and-login-button";
import LogoutMenuItem from "@/components/Auth/logout-menu-item";
import type { AuthUser } from "@/types/user";

interface HeaderClientProps {
    user: AuthUser | null;
}

export default function HeaderClient({ user }: HeaderClientProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const displayName = user?.display_name ?? user?.email ?? "Usuario";
    const profileSlug = user
        ? encodeURIComponent(
            user.display_name?.trim() ||
            user.email?.split("@")[0] ||
            user.id
        )
        : "";
    const profileHref = user ? `/${profileSlug}` : "";

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <img src="/logo_a.png" className="inline-flex h-14 w-14 items-center justify-center rounded-xl"/>
                    <p className="text-xl">AnimeFlick</p>
                </Link>

                <SearchInput />

                {/* Desktop Nav */}
                <nav className="ml-auto hidden items-center gap-2 md:flex">
                    <Link
                        href="/search"
                        className="rounded-xl border px-3 py-2 text-sm font-medium hover:bg-accent"
                    >
                        Explorar
                    </Link>
                    <Link
                        href="/me/favorites"
                        className="rounded-xl border px-3 py-2 text-sm font-medium hover:bg-accent"
                    >
                        Favoritos
                    </Link>
                    {user ? (
                        <Link
                            href="/me"
                            className="rounded-xl border px-3 py-2 text-sm font-medium hover:bg-accent"
                        >
                            Mis listas
                        </Link>
                    ): null}
                    {user ? (
                        <details className="relative">
                            <summary className="list-none">
                                <span
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background hover:opacity-90 cursor-pointer"
                                    title={displayName}
                                    aria-label={`Perfil de ${displayName}`}
                                >
                                    {displayName.slice(0, 1).toUpperCase()}
                                </span>
                            </summary>
                            <div className="absolute right-0 mt-2 w-44 rounded-xl border bg-card p-2 shadow-lg">
                                <Link
                                    href={profileHref}
                                    className="block rounded-lg px-3 py-2 text-sm hover:bg-accent"
                                >
                                    Ver perfil
                                </Link>
                                <LogoutMenuItem className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-accent" />
                            </div>
                        </details>
                    ) : (
                        <LogoutAndLoginButton />
                    )}
                </nav>

                {/* Mobile Menu Button */}
                <button
                    onClick={toggleMenu}
                    className="ml-auto md:hidden p-2 rounded-md hover:bg-accent"
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t bg-background">
                    <div className="mx-auto max-w-6xl px-4 py-4 space-y-2">
                        <Link
                            href="/search"
                            className="block rounded-xl border px-3 py-2 text-sm font-medium hover:bg-accent"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Explorar
                        </Link>
                        <Link
                            href="/me/favorites"
                            className="block rounded-xl border px-3 py-2 text-sm font-medium hover:bg-accent"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Favoritos
                        </Link>
                        {user ? (
                            <Link
                                href="/me"
                                className="block rounded-xl border px-3 py-2 text-sm font-medium hover:bg-accent"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Mis listas
                            </Link>
                        ): null}
                        {user ? (
                            <div className="space-y-2">
                                <Link
                                    href={profileHref}
                                    className="block rounded-xl border px-3 py-2 text-sm font-medium hover:bg-accent"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Ver perfil
                                </Link>
                                <LogoutMenuItem className="block w-full rounded-xl border px-3 py-2 text-left text-sm hover:bg-accent" />
                            </div>
                        ) : (
                            <LogoutAndLoginButton />
                        )}
                    </div>
                </div>
            )}

            {/* Search mobile */}
            <SearchMobile />
        </header>
    );
}
