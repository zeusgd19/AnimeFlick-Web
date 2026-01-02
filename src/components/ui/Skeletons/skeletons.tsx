export function SkeletonCard() {
    return (
        <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
            <div className="aspect-[2/3] w-full animate-pulse bg-accent" />
            <div className="p-3 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-accent" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-accent" />
            </div>
        </div>
    );
}

export function SkeletonGrid({ count = 10 }: { count?: number }) {
    return (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}
