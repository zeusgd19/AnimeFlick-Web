"use client";
import {useAuth} from "@/context/auth-context";
import {useRouter} from "next/navigation";
import Link from "next/link";

export default function LogoutAndLoginButton() {
    const router = useRouter();
    const {user, logout} = useAuth();

    return(
        <>
            {!user ? (
                <Link
                    href="/login"
                    className="rounded-xl bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90"
                >
                    Entrar
                </Link>
            ): (
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
        </>
)
}