"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type UiStatus = "watching" | "completed" | "paused" | "none"; // ✅ lo que acepta tu backend

const LISTS: { status: UiStatus; label: string; desc: string; icon: string }[] = [
    { status: "watching", label: "Siguiendo", desc: "Lo estás viendo ahora", icon: "▶" },
    { status: "paused", label: "En pausa", desc: "Lo retomas más tarde", icon: "⏸" },
    { status: "completed", label: "Completado", desc: "Ya lo terminaste", icon: "✓" },
    { status: "none", label: "Eliminar", desc: "Quitar de la lista", icon: "x" }
];

export default function AddToProgressMenu({
                                              anime,
                                          }: {
    anime: {
        anime_slug: string;
        title: string;
        cover: string;
        rating: string;
        type: string;
    };
}) {
    const router = useRouter();
    const pathname = usePathname();
    const nextUrl = useMemo(() => encodeURIComponent(pathname), [pathname]);

    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState<UiStatus | null>(null);
    const [msg, setMsg] = useState<string | null>(null);

    async function add(status: UiStatus) {
        setBusy(status);
        setMsg(null);

        const payload = { ...anime, status };

        const res = await fetch("/api/me/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (res.status === 401) {
            router.push(`/login?next=${nextUrl}`);
            return;
        }

        if (!res.ok) {
            const t = await res.text().catch(() => "");
            setMsg(`No se pudo guardar. ${t || ""}`.trim());
            setBusy(null);
            return;
        }

        setMsg("Guardado ✓");
        router.refresh();

        setTimeout(() => {
            setOpen(false);
            setBusy(null);
            setMsg(null);
        }, 400);
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
            >
                + Añadir a mi lista
            </button>

            {open ? (
                <div className="fixed inset-0 z-[70]">
                    {/* Backdrop */}
                    <button
                        type="button"
                        aria-label="Cerrar"
                        className="absolute inset-0 bg-black/90"
                        onClick={() => (busy ? null : setOpen(false))}
                    />

                    {/* Modal */}
                    <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2">
                        <div className="rounded-3xl border bg-card shadow-2xl">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3 border-b p-4">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold">Añadir a lista</p>
                                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                                        {anime.title}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => (busy ? null : setOpen(false))}
                                    disabled={!!busy}
                                    className="rounded-xl border bg-card px-3 py-2 text-sm font-medium hover:bg-accent disabled:opacity-60"
                                    title="Cerrar"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <div className="grid gap-2">
                                    {LISTS.map((l) => {
                                        const loading = busy === l.status;
                                        return (
                                            <button
                                                key={l.status}
                                                type="button"
                                                onClick={() => add(l.status)}
                                                disabled={!!busy}
                                                className={[
                                                    "group flex w-full items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-3 text-left hover:bg-accent",
                                                    loading ? "opacity-70" : "",
                                                ].join(" ")}
                                            >
                                                <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 place-items-center rounded-xl border bg-card text-sm">
                            {l.icon}
                          </span>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold">{l.label}</p>
                                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                                            {l.desc}
                                                        </p>
                                                    </div>
                                                </div>

                                                <span className="text-sm text-muted-foreground group-hover:text-foreground">
                          {loading ? "…" : "→"}
                        </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* feedback */}
                                {msg ? (
                                    <div className="mt-3 rounded-2xl border bg-card p-3 text-sm text-muted-foreground">
                                        {msg}
                                    </div>
                                ) : null}

                                {/* footer */}
                                <div className="mt-4 flex items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => (busy ? null : setOpen(false))}
                                        disabled={!!busy}
                                        className="rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-60"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}
