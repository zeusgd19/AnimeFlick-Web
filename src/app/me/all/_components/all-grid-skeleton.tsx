// src/app/me/all/_components/all-grid-skeleton.tsx
function CardSk() {
    return (
        <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
            <div className="aspect-[2/3] w-full animate-pulse bg-accent" />
            <div className="p-3">
                <div className="h-3 w-4/5 animate-pulse rounded bg-accent" />
            </div>
        </div>
    );
}

export default function AllGridSkeleton() {
    return (
        <section className="rounded-3xl border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <div className="h-6 w-40 animate-pulse rounded bg-accent" />
                    <div className="mt-2 h-4 w-64 animate-pulse rounded bg-accent" />
                </div>
                <div className="h-6 w-28 animate-pulse rounded-full border bg-card/60" />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {Array.from({ length: 20 }).map((_, i) => (
                    <CardSk key={i} />
                ))}
            </div>

            <div className="mt-6 flex items-center justify-center gap-2">
                <div className="h-9 w-9 animate-pulse rounded-xl border bg-card" />
                <div className="h-9 w-9 animate-pulse rounded-xl border bg-card" />
                <div className="h-9 w-9 animate-pulse rounded-xl border bg-card" />
            </div>
        </section>
    );
}
