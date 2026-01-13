"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {useAuth} from "@/context/auth-context";
import {primeWatchedEpisodes} from "@/lib/watched/prime-watched";
import {ensureFavoritesSynced} from "@/lib/utils/favorite";

export default function LoginForm() {
    const router = useRouter();
    const sp = useSearchParams();

    const next = sp.get("next") ?? "/"; // para redirigir donde venías
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {setUser} = useAuth();

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const fd = new FormData(e.currentTarget);

        const email = String(fd.get("email") ?? "").trim();
        const password = String(fd.get("password") ?? "");
        const remember = fd.get("remember") === "on";

        if (!email || !password) {
            setLoading(false);
            setError("Introduce email y contraseña.");
            return;
        }

        try {
            const res = await fetch("/api/auth/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // Si tu backend soporta remember, se lo pasas. Si no, lo ignoras.
                body: JSON.stringify({ email, password, remember }),
                cache: "no-store",
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.message ?? "Email o contraseña incorrectos.");
            }

            const json = await res.json();
            setUser(json.user);
            await primeWatchedEpisodes();
            await ensureFavoritesSynced(true);
            router.push(next);
            router.refresh(); // para que layouts/server components pillen cookies nuevas
        } catch (err: any) {
            setError(err?.message ?? "Error inesperado al iniciar sesión.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            <label className="grid gap-2">
                <span className="text-sm font-medium">Email</span>
                <input
                    name="email"
                    type="email"
                    placeholder="tuemail@ejemplo.com"
                    autoComplete="email"
                    className="h-11 w-full rounded-2xl border bg-card px-4 text-sm outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10"
                />
            </label>

            <label className="grid gap-2">
                <span className="text-sm font-medium">Contraseña</span>
                <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="h-11 w-full rounded-2xl border bg-card px-4 text-sm outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10"
                />
            </label>

            <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input name="remember" type="checkbox" className="h-4 w-4 rounded border" />
                    Recuérdame
                </label>

                <Link
                    href="/forgot"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                    ¿Olvidaste la contraseña?
                </Link>
            </div>

            {error ? (
                <div className="rounded-2xl border bg-card p-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Error:</span> {error}
                </div>
            ) : null}

            <button
                type="submit"
                disabled={loading}
                className="mt-2 h-11 rounded-2xl bg-foreground px-4 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
            >
                {loading ? "Entrando..." : "Entrar"}
            </button>

            <div className="relative py-2">
                <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
                <span className="relative mx-auto block w-fit bg-card px-3 text-xs text-muted-foreground">
          o continúa con
        </span>
            </div>

            <button
                type="button"
                className="h-11 rounded-2xl border bg-card px-4 text-sm font-medium hover:bg-accent"
                title="Demo"
            >
                Continuar con Google
            </button>

            <p className="pt-2 text-sm text-muted-foreground">
                ¿No tienes cuenta?{" "}
                <Link href="/register" className="font-medium text-foreground hover:underline">
                    Regístrate
                </Link>
            </p>
        </form>
    );
}
