"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {SignUpUser} from "@/lib/providers/user";
import {AuthBody, SignUpResponse} from "@/types/user";

export default function RegisterForm() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const fd = new FormData(e.currentTarget);

        const username = String(fd.get("username") ?? "").trim();
        const email = String(fd.get("email") ?? "").trim();
        const password = String(fd.get("password") ?? "");
        const password2 = String(fd.get("password2") ?? "");
        const accepted = fd.get("terms") === "on";

        // Validación rápida (UI)
        if (!accepted) {
            setLoading(false);
            setError("Debes aceptar los términos y la privacidad.");
            return;
        }
        if (!username || !email || !password || !password2) {
            setLoading(false);
            setError("Rellena todos los campos.");
            return;
        }
        if (password !== password2) {
            setLoading(false);
            setError("Las contraseñas no coinciden.");
            return;
        }

        const authBody: AuthBody = {
            email: email,
            password: password,
            display_name: username
        }

        try {
            const signUpResponse = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(authBody),
            });

            if(signUpResponse.ok) {
                router.push(`/verify-email?email=${encodeURIComponent(email)}`);
            }
        } catch (err: any) {
            setError(err?.message ?? "Error inesperado");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            <label className="grid gap-2">
                <span className="text-sm font-medium">Nombre de usuario</span>
                <input
                    name="username"
                    placeholder="tu_usuario"
                    autoComplete="username"
                    className="h-11 w-full rounded-2xl border bg-card px-4 text-sm outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10"
                />
            </label>

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
                    autoComplete="new-password"
                    className="h-11 w-full rounded-2xl border bg-card px-4 text-sm outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10"
                />
            </label>

            <label className="grid gap-2">
                <span className="text-sm font-medium">Repite la contraseña</span>
                <input
                    name="password2"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="h-11 w-full rounded-2xl border bg-card px-4 text-sm outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10"
                />
            </label>

            <label className="flex items-start gap-2 text-sm text-muted-foreground">
                <input name="terms" type="checkbox" className="mt-0.5 h-4 w-4 rounded border" />
                <span>
          Acepto los{" "}
                    <Link href="/legal" className="font-medium text-foreground hover:underline">
            términos
          </Link>{" "}
                    y la{" "}
                    <Link href="/privacy" className="font-medium text-foreground hover:underline">
            privacidad
          </Link>
          .
        </span>
            </label>

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
                {loading ? "Creando..." : "Crear cuenta"}
            </button>
            <p className="pt-2 text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="font-medium text-foreground hover:underline">
                    Inicia sesión
                </Link>
            </p>
        </form>
    );
}
