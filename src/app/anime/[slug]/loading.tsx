// src/app/anime/[slug]/loading.tsx
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";

function BadgeSkeleton() {
    return <div className="h-6 w-20 animate-pulse rounded-full border bg-card/60 backdrop-blur" />;
}

function StatSkeleton() {
    return (
        <div className="rounded-2xl border bg-card p-3">
            <div className="h-3 w-20 animate-pulse rounded bg-accent" />
            <div className="mt-2 h-4 w-28 animate-pulse rounded bg-accent" />
        </div>
    );
}

function EpisodeSkeleton() {
    return (
        <div className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-3">
            <div className="min-w-0 flex-1">
                <div className="h-4 w-32 animate-pulse rounded bg-accent" />
                <div className="mt-2 h-3 w-48 animate-pulse rounded bg-accent" />
            </div>
            <div className="flex shrink-0 items-center gap-2">
                <div className="h-9 w-16 animate-pulse rounded-xl bg-accent" />
                <div className="h-9 w-20 animate-pulse rounded-xl border bg-card" />
            </div>
        </div>
    );
}

function RelatedSkeleton() {
    return (
        <div className="rounded-2xl border bg-card p-4">
            <div className="h-4 w-40 animate-pulse rounded bg-accent" />
            <div className="mt-2 h-3 w-24 animate-pulse rounded bg-accent" />
        </div>
    );
}

export default function Loading() {
    return (
        <div className="min-h-dvh bg-background">
            <Header />

            {/* HERO */}
            <section className="relative overflow-hidden border-b">
                <div className="absolute inset-0">
                    {/* Banner skeleton */}
                    <div className="h-full w-full animate-pulse bg-accent opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/80 to-background" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
                </div>

                <div className="relative mx-auto max-w-6xl px-4 py-8 md:py-10">
                    {/* Breadcrumb skeleton */}
                    <div className="mb-5 flex flex-wrap items-center gap-2">
                        <div className="h-4 w-14 animate-pulse rounded bg-accent" />
                        <div className="h-4 w-4 animate-pulse rounded bg-accent" />
                        <div className="h-4 w-16 animate-pulse rounded bg-accent" />
                        <div className="h-4 w-4 animate-pulse rounded bg-accent" />
                        <div className="h-4 w-44 animate-pulse rounded bg-accent" />
                    </div>

                    <div className="grid gap-6 md:grid-cols-[180px_1fr]">
                        {/* Floating cover skeleton */}
                        <div className="w-[180px]">
                            <div className="relative">
                                <div className="absolute -inset-2 rounded-3xl bg-foreground/10 blur-xl" />
                                <div className="relative overflow-hidden rounded-3xl border bg-card shadow-sm">
                                    <div className="aspect-[2/3] w-full animate-pulse bg-accent" />
                                </div>
                            </div>
                        </div>

                        {/* Title + chips + actions skeleton */}
                        <div className="flex flex-col justify-center">
                            <div className="flex flex-wrap gap-2">
                                <BadgeSkeleton />
                                <BadgeSkeleton />
                                <BadgeSkeleton />
                                <BadgeSkeleton />
                            </div>

                            <div className="mt-4 h-10 w-3/4 animate-pulse rounded bg-accent" />

                            <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-accent" />

                            <div className="mt-5 flex flex-wrap gap-2">
                                <div className="h-10 w-44 animate-pulse rounded-2xl bg-accent" />
                                <div className="h-10 w-28 animate-pulse rounded-2xl border bg-card" />
                                <div className="h-10 w-40 animate-pulse rounded-2xl border bg-card" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CONTENT */}
            <main className="mx-auto max-w-6xl px-4 py-8">
                <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                    {/* LEFT */}
                    <div className="space-y-6">
                        {/* Overview */}
                        <section className="rounded-3xl border bg-card p-6 shadow-sm">
                            <div className="flex items-end justify-between gap-3">
                                <div>
                                    <div className="h-6 w-28 animate-pulse rounded bg-accent" />
                                    <div className="mt-2 h-4 w-40 animate-pulse rounded bg-accent" />
                                </div>
                                <div className="h-10 w-28 animate-pulse rounded-2xl border bg-card" />
                            </div>

                            <div className="mt-4 space-y-2">
                                <div className="h-4 w-full animate-pulse rounded bg-accent" />
                                <div className="h-4 w-11/12 animate-pulse rounded bg-accent" />
                                <div className="h-4 w-10/12 animate-pulse rounded bg-accent" />
                            </div>

                            <div className="mt-5 flex flex-wrap gap-2">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="h-10 w-24 animate-pulse rounded-2xl border bg-card" />
                                ))}
                            </div>
                        </section>

                        {/* Episodes with internal scroll */}
                        <section className="rounded-3xl border bg-card p-6 shadow-sm">
                            <div className="flex flex-wrap items-end justify-between gap-3">
                                <div>
                                    <div className="h-6 w-28 animate-pulse rounded bg-accent" />
                                    <div className="mt-2 h-4 w-56 animate-pulse rounded bg-accent" />
                                </div>
                                <div className="flex gap-2">
                                    <BadgeSkeleton />
                                    <div className="h-10 w-28 animate-pulse rounded-2xl border bg-card" />
                                </div>
                            </div>

                            <div className="mt-4 max-h-[520px] overflow-y-auto pr-2 overscroll-contain">
                                <div className="grid gap-2">
                                    {Array.from({ length: 10 }).map((_, i) => (
                                        <EpisodeSkeleton key={i} />
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Related */}
                        <section className="rounded-3xl border bg-card p-6 shadow-sm">
                            <div>
                                <div className="h-6 w-28 animate-pulse rounded bg-accent" />
                                <div className="mt-2 h-4 w-52 animate-pulse rounded bg-accent" />
                            </div>

                            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <RelatedSkeleton key={i} />
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT: Sticky sidebar */}
                    <aside className="lg:sticky lg:top-20 h-fit space-y-6">
                        <section className="rounded-3xl border bg-card p-6 shadow-sm">
                            <div className="h-4 w-20 animate-pulse rounded bg-accent" />
                            <div className="mt-4 grid gap-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <StatSkeleton key={i} />
                                ))}
                            </div>

                            <div className="mt-5 rounded-2xl border bg-card p-4">
                                <div className="h-3 w-24 animate-pulse rounded bg-accent" />
                                <div className="mt-2 h-4 w-full animate-pulse rounded bg-accent" />
                                <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-accent" />
                            </div>
                        </section>

                        <section className="rounded-3xl border bg-card p-6 shadow-sm">
                            <div className="h-4 w-20 animate-pulse rounded bg-accent" />
                            <div className="mt-3 grid gap-2">
                                <div className="h-10 w-full animate-pulse rounded-2xl bg-accent" />
                                <div className="h-10 w-full animate-pulse rounded-2xl border bg-card" />
                                <div className="h-10 w-full animate-pulse rounded-2xl border bg-card" />
                            </div>
                        </section>
                    </aside>
                </div>

                {/* Footer skeleton */}
                <Footer/>
            </main>
        </div>
    );
}
