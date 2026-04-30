"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Compass, Heart, LifeBuoy, Bookmark, User } from "lucide-react";
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
                    <img src="/logo_a.png" className="inline-flex h-14 w-14 items-center justify-center rounded-xl" />
                    <p className="text-xl">AnimeFlick</p>
                </Link>

                <SearchInput />

                {/* Desktop Nav */}
                <nav className="ml-auto hidden items-center gap-2 md:flex">
                    <Link
                        href="/search"
                        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                        <Compass size={16} />
                        Explorar
                    </Link>
                    <Link
                        href="/soporte"
                        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                        <LifeBuoy size={16} />
                        Soporte
                    </Link>
                    
                    {user ? (
                        <details className="relative ml-2">
                            <summary className="list-none outline-none">
                                <span
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background hover:opacity-90 cursor-pointer transition-opacity"
                                    title={displayName}
                                    aria-label={`Perfil de ${displayName}`}
                                >
                                    {Array.from(displayName)[0].toUpperCase()}
                                </span>
                            </summary>
                            <div className="absolute right-0 mt-2 w-48 rounded-xl border p-2 shadow-xl bg-background flex flex-col gap-1">
                                <div className="px-3 py-2 mb-1 border-b">
                                    <p className="text-sm font-semibold truncate">{displayName}</p>
                                </div>
                                
                                <Link
                                    href={profileHref}
                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
                                >
                                    <User size={16} className="text-muted-foreground" />
                                    Mi Perfil
                                </Link>
                                <Link
                                    href="/me/favorites"
                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
                                >
                                    <Heart size={16} className="text-muted-foreground" />
                                    Favoritos
                                </Link>
                                <Link
                                    href="/me"
                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
                                >
                                    <Bookmark size={16} className="text-muted-foreground" />
                                    Mis listas
                                </Link>
                                <div className="mt-1 pt-1 border-t">
                                    <LogoutMenuItem className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent cursor-pointer transition-colors text-red-500 hover:text-red-600 hover:bg-red-500/10" />
                                </div>
                            </div>
                        </details>
                    ) : (
                        <div className="ml-2">
                            <LogoutAndLoginButton />
                        </div>
                    )}
                </nav>

                {/* Mobile Menu Button */}
                <button
                    onClick={toggleMenu}
                    className="ml-auto md:hidden p-2 rounded-md hover:bg-accent transition-colors"
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t bg-background">
                    <div className="mx-auto max-w-6xl px-4 py-4 space-y-1">
                        <Link
                            href="/search"
                            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-accent transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <Compass size={18} className="text-muted-foreground" />
                            Explorar
                        </Link>
                        <Link
                            href="/soporte"
                            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-accent transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <LifeBuoy size={18} className="text-muted-foreground" />
                            Soporte
                        </Link>
                        
                        {user && (
                            <div className="py-2 my-2 border-y">
                                <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mi Cuenta</p>
                                <Link
                                    href={profileHref}
                                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-accent transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <User size={18} className="text-muted-foreground" />
                                    Mi Perfil
                                </Link>
                                <Link
                                    href="/me/favorites"
                                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-accent transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <Heart size={18} className="text-muted-foreground" />
                                    Favoritos
                                </Link>
                                <Link
                                    href="/me"
                                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-accent transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <Bookmark size={18} className="text-muted-foreground" />
                                    Mis listas
                                </Link>
                            </div>
                        )}
                        
                        <div className="pt-2">
                            {user ? (
                                <LogoutMenuItem className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium hover:bg-red-500/10 text-red-500 transition-colors" />
                            ) : (
                                <LogoutAndLoginButton />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Search mobile */}
            <SearchMobile />
        </header>
    );
}
