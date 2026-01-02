import Link from "next/link";

export function ErrorState({
                               title = "No se ha podido cargar",
                               description = "Prueba a recargar o vuelve más tarde.",
                               actionHref,
                               actionLabel = "Reintentar",
                           }: {
    title?: string;
    description?: string;
    actionHref?: string;
    actionLabel?: string;
}) {
    return (
        <div className="mt-4 rounded-3xl border bg-card p-6">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>

            <div className="mt-4 flex gap-2">
                {actionHref ? (
                    <Link
                        href={actionHref}
                        className="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
                    >
                        {actionLabel}
                    </Link>
                ) : null}

                <Link
                    href="/public"
                    className="rounded-2xl border px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                    Volver al inicio
                </Link>
            </div>
        </div>
    );
}