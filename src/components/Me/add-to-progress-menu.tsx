"use client";

import { useMemo, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export type ProgressStatus = "watching" | "completed" | "paused" | "none";
type Variant = "primary" | "ghost" | "compact";

const DEFAULT_LISTS: {
    status: ProgressStatus;
    label: string;
    desc: string;
    icon: string;
}[] = [
    { status: "watching", label: "Siguiendo", desc: "Lo estás viendo ahora", icon: "▶" },
    { status: "paused", label: "En pausa", desc: "Lo retomas más tarde", icon: "⏸" },
    { status: "completed", label: "Completado", desc: "Ya lo terminaste", icon: "✓" },
    { status: "none", label: "Quitar", desc: "Eliminar de tu lista", icon: "✕" },
];

export default function AddToProgressMenu({
                                              anime,
                                              variant = "primary",
                                              triggerLabel = "+ Añadir a mi lista",
                                              title = "Añadir a lista",
                                              endpoint = "/api/me/progress",
                                              showRemove = true,
                                              activeStatus,
                                              action,
                                              // style overrides
                                              triggerClassName = "",
                                              backdropClassName = "",
                                              panelClassName = "",
                                              itemClassName = "",
                                          }: {
    anime: {
        anime_slug: string;
        title: string;
        cover: string;
        rating: string;
        type: string;
    };

    variant?: Variant;
    triggerLabel?: string;
    title?: string;
    endpoint?: string; // POST { ...anime, status }
    showRemove?: boolean; // muestra "Quitar"
    activeStatus?: ProgressStatus; // opcional: resalta el status actual
    action?: (status: ProgressStatus) => void;

    triggerClassName?: string;
    backdropClassName?: string;
    panelClassName?: string;
    itemClassName?: string;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const nextUrl = useMemo(() => encodeURIComponent(pathname), [pathname]);

    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState<ProgressStatus | null>(null);
    const [msg, setMsg] = useState<string | null>(null);

    const lists = useMemo(() => {
        if (showRemove) return DEFAULT_LISTS;
        return DEFAULT_LISTS.filter((x) => x.status !== "none");
    }, [showRemove]);

    const triggerBase =
        variant === "primary"
            ? "rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
            : variant === "ghost"
                ? "rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
                : "rounded-xl border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent";

    async function add(status: ProgressStatus) {
        setBusy(status);
        setMsg(null);

        const payload = { ...anime, status };

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.status === 401) {
                setBusy(null);
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
            action?.(status);

            // refresca server components si esta página depende de la lista
            router.refresh();

            setTimeout(() => {
                setOpen(false);
                setBusy(null);
                setMsg(null);
            }, 350);
        } catch {
            setMsg("No se pudo guardar (error de red).");
            setBusy(null);
        }
    }

    // Cerrar con ESC
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !busy) setOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, busy]);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={[triggerClassName].join(" ")}
            >
                {triggerLabel}
            </button>

            {open ? (
                <div className="fixed inset-0 z-[70]">
                    {/* Backdrop */}
                    <button
                        type="button"
                        aria-label="Cerrar"
                        className={[
                            "absolute inset-0 bg-black/80",
                            busy ? "cursor-not-allowed" : "cursor-pointer",
                            backdropClassName,
                        ].join(" ")}
                        onClick={() => (busy ? null : setOpen(false))}
                    />

                    {/* Panel */}
                    <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2">
                        <div
                            className={[
                                "rounded-3xl border bg-card shadow-2xl",
                                "overflow-hidden",
                                panelClassName,
                            ].join(" ")}
                            role="dialog"
                            aria-modal="true"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3 border-b p-4">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold">{title}</p>
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
                                    {lists.map((l) => {
                                        const loading = busy === l.status;
                                        const selected = activeStatus === l.status;

                                        return (
                                            <button
                                                key={l.status}
                                                type="button"
                                                onClick={() => add(l.status)}
                                                disabled={!!busy}
                                                className={[
                                                    "group flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition",
                                                    "bg-card hover:bg-accent",
                                                    selected ? "border-foreground/40" : "",
                                                    loading ? "opacity-70" : "",
                                                    itemClassName,
                                                ].join(" ")}
                                            >
                                                <div className="flex items-center gap-3">
                          <span
                              className={[
                                  "grid h-9 w-9 place-items-center rounded-xl border bg-card text-sm",
                                  selected ? "bg-foreground text-background" : "",
                              ].join(" ")}
                          >
                            {l.icon}
                          </span>

                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold">
                                                            {l.label}{" "}
                                                            {selected ? (
                                                                <span className="ml-2 text-xs text-muted-foreground">(actual)</span>
                                                            ) : null}
                                                        </p>
                                                        <p className="mt-0.5 text-xs text-muted-foreground">{l.desc}</p>
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

                                {/* Footer */}
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

                        {/* Hint */}
                        <p className="mt-3 text-center text-xs text-muted-foreground">
                            Tip: pulsa <span className="font-medium text-foreground/80">ESC</span> para cerrar.
                        </p>
                    </div>
                </div>
            ) : null}
        </>
    );
}
