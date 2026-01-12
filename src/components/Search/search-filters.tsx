"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { RealAnimeType } from "@/types/anime";

const TYPES: { key: RealAnimeType; label: string }[] = [
    { key: "tv", label: "TV" },
    { key: "movie", label: "Películas" },
    { key: "special", label: "Especial" },
    { key: "ova", label: "OVA" },
];

// Ojo: etiqueta según tu backend. Si tu API usa otro mapping, cambia aquí.
const STATUSES: { key: 1 | 2 | 3; label: string }[] = [
    { key: 1, label: "En emisión" },
    { key: 2, label: "Finalizado" },
    { key: 3, label: "Próximamente" },
];

const GENRES = [
    "accion",
    "artes-marciales",
    "aventura",
    "carreras",
    "ciencia-ficcion",
    "comedia",
    "demencia",
    "demonios",
    "deportes",
    "drama",
    "ecchi",
    "escolares",
    "espacial",
    "fantasia",
    "harem",
    "historico",
    "infantil",
    "josei",
    "juegos",
    "magia",
    "mecha",
    "militar",
    "misterio",
    "musica",
    "parodia",
    "policia",
    "psicologico",
    "recuentos-de-la-vida",
    "romance",
    "samurai",
    "seinen",
    "shoujo",
    "shounen",
    "sobrenatural",
    "superpoderes",
    "suspenso",
    "terror",
    "vampiros",
    "yaoi",
    "yuri",
] as const;

function prettyGenre(g: string) {
    // "recuentos-de-la-vida" -> "Recuentos de la vida"
    const s = g.replaceAll("-", " ");
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function toggle<T>(arr: T[], v: T) {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

type Props = {
    initialTypes: RealAnimeType[];
    initialGenres: string[];
    initialStatuses: number[];
};

export default function SearchFilters({ initialTypes, initialGenres, initialStatuses }: Props) {
    const router = useRouter();
    const sp = useSearchParams();

    const [open, setOpen] = useState(false);

    const [types, setTypes] = useState<RealAnimeType[]>(initialTypes);
    const [genres, setGenres] = useState<string[]>(initialGenres);
    const [statuses, setStatuses] = useState<number[]>(initialStatuses);

    const activeCount = types.length + genres.length + statuses.length;

    const q = sp.get("q") ?? "";
    const page = sp.get("page") ?? "";

    const apply = () => {
        const params = new URLSearchParams();

        // conserva q si existe
        if (q.trim()) params.set("q", q.trim());

        // resetea page al aplicar filtros
        params.set("page", "1");

        // arrays: append
        types.forEach((t) => params.append("type", t));
        genres.forEach((g) => params.append("genre", g));
        statuses.forEach((s) => params.append("status", String(s)));

        router.push(`/search?${params.toString()}`);
        setOpen(false);
    };

    const clear = () => {
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        // si quieres conservar page al limpiar, usa `page`; yo lo reseteo a 1
        params.set("page", "1");

        router.push(`/search?${params.toString()}`);
        setOpen(false);
    };

    const resetLocalToUrl = () => {
        // por si el usuario abre/cierra sin aplicar
        setTypes(initialTypes);
        setGenres(initialGenres);
        setStatuses(initialStatuses);
    };

    const chips = useMemo(() => {
        const list: { key: string; label: string }[] = [];

        types.forEach((t) => list.push({ key: `t:${t}`, label: `Tipo: ${t.toUpperCase()}` }));
        genres.forEach((g) => list.push({ key: `g:${g}`, label: `Género: ${prettyGenre(g)}` }));
        statuses.forEach((s) => list.push({ key: `s:${s}`, label: `Estado: ${s}` }));

        return list;
    }, [types, genres, statuses]);

    return (
        <div className="mt-6">
            {/* barra superior */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
                    >
                        Filtros{activeCount ? ` (${activeCount})` : ""}
                    </button>

                    {activeCount ? (
                        <button
                            type="button"
                            onClick={clear}
                            className="rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
                        >
                            Limpiar
                        </button>
                    ) : null}
                </div>

                {/* chips */}
                {activeCount ? (
                    <div className="flex flex-wrap gap-2">
                        {chips.slice(0, 6).map((c) => (
                            <span
                                key={c.key}
                                className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground"
                            >
                {c.label}
              </span>
                        ))}
                        {chips.length > 6 ? (
                            <span className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
                +{chips.length - 6} más
              </span>
                        ) : null}
                    </div>
                ) : null}
            </div>

            {/* modal */}
            {open ? (
                <div className="fixed inset-0 z-50">
                    <button
                        type="button"
                        onClick={() => {
                            setOpen(false);
                            resetLocalToUrl();
                        }}
                        className="absolute inset-0 bg-black/50"
                        aria-label="Cerrar"
                    />

                    <div className="absolute left-1/2 top-1/2 w-[94vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-3xl border bg-card p-5 shadow-xl">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-lg font-semibold">Filtros</p>
                                <p className="text-sm text-muted-foreground">
                                    Ajusta los filtros y pulsa “Aplicar”.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setOpen(false);
                                    resetLocalToUrl();
                                }}
                                className="rounded-2xl border bg-card px-3 py-2 text-sm font-medium hover:bg-accent"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-5 grid gap-6 md:grid-cols-3">
                            {/* Types */}
                            <div className="rounded-2xl border bg-card p-4">
                                <p className="text-sm font-semibold">Tipo</p>
                                <div className="mt-3 grid gap-2">
                                    {TYPES.map((t) => (
                                        <label key={t.key} className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <input
                                                type="checkbox"
                                                checked={types.includes(t.key)}
                                                onChange={() => setTypes((prev) => toggle(prev, t.key))}
                                                className="h-4 w-4 rounded border"
                                            />
                                            <span className="text-foreground">{t.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="rounded-2xl border bg-card p-4">
                                <p className="text-sm font-semibold">Estado</p>
                                <div className="mt-3 grid gap-2">
                                    {STATUSES.map((s) => (
                                        <label key={s.key} className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <input
                                                type="checkbox"
                                                checked={statuses.includes(s.key)}
                                                onChange={() => setStatuses((prev) => toggle(prev, s.key))}
                                                className="h-4 w-4 rounded border"
                                            />
                                            <span className="text-foreground">{s.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Genres */}
                            <div className="rounded-2xl border bg-card p-4">
                                <p className="text-sm font-semibold">Géneros</p>
                                <p className="mt-1 text-xs text-muted-foreground">Puedes seleccionar varios</p>

                                <div className="mt-3 max-h-[260px] overflow-y-auto pr-2">
                                    <div className="grid gap-2">
                                        {GENRES.map((g) => (
                                            <label key={g} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <input
                                                    type="checkbox"
                                                    checked={genres.includes(g)}
                                                    onChange={() => setGenres((prev) => toggle(prev, g))}
                                                    className="h-4 w-4 rounded border"
                                                />
                                                <span className="text-foreground">{prettyGenre(g)}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap justify-end gap-2">
                            <button
                                type="button"
                                onClick={clear}
                                className="rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
                            >
                                Limpiar
                            </button>
                            <button
                                type="button"
                                onClick={apply}
                                className="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
                            >
                                Aplicar
                            </button>
                        </div>

                        <div className="mt-3 text-xs text-muted-foreground">
                            Tip: al aplicar filtros, la página vuelve a la 1.
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
