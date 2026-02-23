"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { ServerEpisodeData, ServerEpisode } from "@/types/anime";
import Hls from "hls.js";

function pickDefaultServer(servers: ServerEpisode[]) {
    const withEmbed = servers.find((s) => !!s.embed);
    return withEmbed ?? servers[0] ?? null;
}

function getHost(url?: string | null) {
    if (!url) return "";
    try {
        return new URL(url).hostname.toLowerCase();
    } catch {
        return "";
    }
}

function shouldDisableSandboxFor(host: string) {
    return (
        host.includes("streamwish") ||
        host.includes("streamwish.to") ||
        host.includes("streamwish.com") ||
        host.includes("swish")
    );
}

type ExtractResultClient =
    | {
    provider: string;
    kind: "hls" | "mp4";
    url: string;
    headers?: Record<string, string>;
    debug?: any;
}
    | null;

async function getExtract(embed?: string) {
    if (!embed) return null;

    const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: embed }),
    });

    if (!res.ok) throw new Error(`extract failed: ${res.status}`);
    return (await res.json()) as { ok: boolean; result: ExtractResultClient };
}

export default function WatchPlayer({
                                        animeSlug,
                                        episode,
                                        animeTitle,
                                    }: {
    animeSlug: string;
    episode: ServerEpisodeData;
    animeTitle?: string;
    animeCover?: string;
}) {
    const servers = episode.servers ?? [];
    const defaultServer = useMemo(() => pickDefaultServer(servers), [servers]);
    const [selected, setSelected] = useState<ServerEpisode | null>(defaultServer);

    const embedUrl = selected?.embed ?? null;

    const host = getHost(embedUrl);
    const disableSandbox = shouldDisableSandboxFor(host);

    const downloadable = servers.filter((s) => !!s.download);

    const [extractErr, setExtractErr] = useState<string | null>(null);
    const [extracted, setExtracted] = useState<ExtractResultClient>(null);

    const videoRef = useRef<HTMLVideoElement | null>(null);

    async function copyLink() {
        const url = `${window.location.origin}/watch/${animeSlug}?ep=${episode.number}`;
        await navigator.clipboard.writeText(url);
    }

    // 1) extrae al cambiar embed
    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setExtractErr(null);
                setExtracted(null);

                if (!embedUrl) return;

                const data = await getExtract(embedUrl);
                if (!cancelled) setExtracted(data?.result ?? null);

                console.log("[extract]", data?.result);
            } catch (e: any) {
                if (!cancelled) setExtractErr(e?.message ?? "unknown error");
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [embedUrl]);

    // 2) monta player según kind
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // reset
        video.pause();
        video.removeAttribute("src");
        video.load();

        if (!extracted?.url) return;

        const referer = embedUrl ?? "";

        if (extracted.kind === "mp4") {
            // ✅ MP4: usa proxy file (evita CORS) y permite Range/seek
            const proxied = `/api/file?u=${encodeURIComponent(extracted.url)}&r=${encodeURIComponent(referer)}`;
            console.log("[MP4] proxied =", proxied);
            video.src = proxied;
            // play manual (puede estar bloqueado)
            video.play().catch(() => {});
            return;
        }

        // ✅ HLS: usa hls.js con proxy HLS (evita CORS)
        const proxied = `/api/hls?u=${encodeURIComponent(extracted.url)}&r=${encodeURIComponent(referer)}`;
        console.log("[HLS] proxied =", proxied);

        if (!Hls.isSupported()) {
            // último fallback: intenta src directo (puede fallar por CORS)
            video.src = proxied;
            video.play().catch(() => {});
            return;
        }

        const hls = new Hls();
        hls.attachMedia(video);

        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            console.log("[HLS] media attached -> load");
            hls.loadSource(proxied);
        });

        hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
            console.log("[HLS] manifest parsed levels:", data.levels?.length);
            video.play().catch((err) => console.log("[HLS] play blocked:", err?.message));
        });

        hls.on(Hls.Events.ERROR, (_evt, data) => {
            console.log("[HLS ERROR]", data.type, data.details, "fatal:", data.fatal);
            if (data?.response) console.log("[HLS HTTP]", data.response.code, data.response.url);

            // recuperación básica
            if (data.fatal) {
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
                else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
                else hls.destroy();
            }
        });

        return () => {
            hls.destroy();
        };
    }, [extracted?.url, extracted?.kind, embedUrl]);

    return (
        <div className="space-y-6">
            <section className="rounded-3xl border bg-card p-6 shadow-sm">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold">{animeTitle ?? episode.title}</h2>
                        <p className="text-sm text-muted-foreground">
                            Episodio {episode.number} · {episode.title}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={copyLink}
                            className="rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
                        >
                            Copiar enlace
                        </button>
                        <Link
                            href={`/anime/${animeSlug}`}
                            className="rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
                        >
                            Ver anime
                        </Link>
                    </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border bg-black/10">
                    <div className="aspect-video w-full">
                        {/* ✅ Si tenemos extracted => video */}
                        {extracted?.url ? (
                            <video ref={videoRef} className="h-full w-full" controls playsInline />
                        ) : embedUrl ? (
                            <iframe
                                key={embedUrl}
                                src={embedUrl}
                                className="h-full w-full"
                                allowFullScreen
                                referrerPolicy="no-referrer"
                                sandbox={
                                    disableSandbox
                                        ? undefined
                                        : "allow-same-origin allow-scripts allow-presentation allow-forms allow-popups"
                                }
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center p-6 text-center">
                                <div>
                                    <p className="text-sm font-semibold">No hay embed disponible</p>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Prueba otro servidor o usa los links de descarga.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {extractErr ? (
                    <div className="mt-3 rounded-2xl border p-3 text-sm">
                        Error extract: {extractErr}
                    </div>
                ) : null}
            </section>

            <section className="rounded-3xl border bg-card p-6 shadow-sm">
                <div className="flex items-end justify-between gap-3">
                    <div>
                        <h3 className="text-lg font-semibold">Servidores</h3>
                        <p className="text-sm text-muted-foreground">Selecciona uno para reproducir o descargar</p>
                    </div>
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
            {servers.length} disponibles
          </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    {servers.map((s, idx) => {
                        const active =
                            selected?.name === s.name && selected?.embed === s.embed && selected?.download === s.download;
                        const disabled = !s.embed && !s.download;

                        return (
                            <button
                                key={`${s.name}-${idx}`}
                                type="button"
                                disabled={disabled}
                                onClick={() => setSelected(s)}
                                className={[
                                    "rounded-2xl border px-4 py-2 text-sm font-medium transition",
                                    active ? "bg-foreground text-background" : "bg-card hover:bg-accent",
                                    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                                ].join(" ")}
                                title={s.embed ? "Reproducir (embed)" : s.download ? "Descargar" : "Sin enlaces"}
                            >
                                {s.name}
                                {s.embed ? " · ▶" : s.download ? " · ↓" : ""}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-5 rounded-2xl border bg-card p-4">
                    <p className="text-xs text-muted-foreground">Servidor seleccionado</p>
                    <p className="mt-1 text-sm font-semibold">{selected?.name ?? "—"}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                        {selected?.embed ? (
                            <a
                                href={selected.embed}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-2xl border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
                            >
                                Abrir embed ↗
                            </a>
                        ) : null}

                        {selected?.download ? (
                            <a
                                href={selected.download}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
                            >
                                Descargar ↓
                            </a>
                        ) : null}
                    </div>
                </div>

                {downloadable.length ? (
                    <div className="mt-5">
                        <p className="text-sm font-semibold">Descargas</p>
                        <p className="mt-1 text-sm text-muted-foreground">Links alternativos por si falla el embed</p>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {downloadable.map((s, i) => (
                                <a
                                    key={`${s.name}-dl-${i}`}
                                    href={s.download!}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-2xl border bg-card px-4 py-3 text-sm font-medium hover:bg-accent"
                                >
                                    {s.name} · Descargar ↓
                                </a>
                            ))}
                        </div>
                    </div>
                ) : null}
            </section>
        </div>
    );
}