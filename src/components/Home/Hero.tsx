"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AnimeCard from "@/components/AnimeCard/anime-card";
import type { AnimeOnAirComplete } from "@/types/anime";

export default function Hero({ animes }: { animes: AnimeOnAirComplete[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (animes.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % animes.length);
        }, 5000); // 5 seconds

        return () => clearInterval(interval);
    }, [animes.length]);

    const currentAnime = animes[currentIndex];

    return (
        <section className="relative overflow-hidden rounded-3xl border bg-card">
            <div className="absolute inset-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={currentAnime?.cover || "/hero.jpg"}
                    alt={"AnimeFlick"}
                    className="h-full w-full object-cover blur-[1px] opacity-25"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/30" />
            </div>

            <div className="relative grid gap-6 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-10">
                <div className="flex flex-col justify-center">
                    <div className="mb-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                            Destacado
                        </span>
                        <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
                            Trending
                        </span>
                    </div>

                    <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">AnimeFlick</h1>
                    <p className="mt-3 max-w-prose text-sm text-muted-foreground">
                        Descubre lo más visto, sigue tu progreso y guarda tus animes en listas.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                        <Link
                            href={`/search`}
                            className="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
                        >
                            Explorar
                        </Link>
                        <Link
                            href={`/login`}
                            className="rounded-2xl border px-4 py-2 text-sm font-medium hover:bg-accent"
                        >
                            Entrar
                        </Link>
                    </div>

                    {/* Android App Download */}
                    <div className="mt-6 rounded-2xl border bg-card/80 p-4 backdrop-blur">
                        <h3 className="text-sm font-semibold">¡Disponible en Android!</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Descarga la app oficial para disfrutar en móvil.
                        </p>
                        <a
                            href="https://github.com/zeusgd19/AnimeFlick/releases/latest"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-block rounded-xl bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90"
                        >
                            Descargar APK
                        </a>
                    </div>
                </div>

                <div className="mx-auto w-full max-w-[260px] md:mx-0 md:ml-auto">
                    {/* Auto-sliding anime cards */}
                    {animes.length > 0 ? (
                        <div className="transition-opacity duration-500">
                            <AnimeCard anime={currentAnime} />
                        </div>
                    ) : (
                        <div className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground">
                            Sin destacado disponible ahora.
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
