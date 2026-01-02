// src/app/watch/[slug]/loading.tsx
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";

function BadgeSkeleton() {
    return <div className="h-6 w-24 animate-pulse rounded-full border bg-card/60 backdrop-blur" />;
}

function ButtonSkeleton({ w = "w-28" }: { w?: string }) {
    return <div className={`h-10 ${w} animate-pulse rounded-2xl border bg-card`} />;
}

function StatSkeleton() {
    return (
        <div className="rounded-2xl border bg-card p-3">
            <div className="h-3 w-20 animate-pulse rounded bg-accent" />
            <div className="mt-2 h-4 w-32 animate-pulse rounded bg-accent" />
        </div>
    );
}

function ServerChipSkeleton() {
    return <div className="h-10 w-28 animate-pulse rounded-2xl border bg-card" />;
}

function DownloadRowSkeleton() {
    return <div className="h-12 w-full animate-pulse rounded-2xl border bg-card" />;
}

export default function Loading() {
    return (
        <div className="min-h-dvh bg-background">
            <Header />

            {/* HERO */}
            <section className="relative overflow-hidden border-b">
                <div className="absolute inset-0">
                    <div className="h-full w-full animate-pulse bg-accent opacity-70" />
                    <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/80 to-background" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
                </div>

                <div className="relative mx-auto max-w-6xl px-4 py-6">
                    {/* Breadcrumb skeleton */}
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                        <div className="h-4 w-14 animate-pulse rounded bg-accent" />
                        <div className="h-4 w-4 animate-pulse rounded bg-accent" />
                        <div className="h-4 w-20 animate-pulse rounded bg-accent" />
                        <div className="h-4 w-4 animate-pulse rounded bg-accent" />
                        <div className="h-4 w-28 animate-pulse rounded bg-accent" />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <div className="h-8 w-72 animate-pulse rounded bg-accent" />
                            <div className="mt-2 h-4 w-44 animate-pulse rounded bg-accent" />

                            <div className="mt-3 flex flex-wrap gap-2">
                                <BadgeSkeleton />
                                <BadgeSkeleton />
                                <BadgeSkeleton />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <ButtonSkeleton w="w-28" />
                            <ButtonSkeleton w="w-24" /> {/* Visto */}
                            <div className="h-10 w-32 animate-pulse rounded-2xl bg-foreground/30" /> {/* Siguiente */}
                        </div>
                    </div>
                </div>
            </section>

            {/* CONTENT */}
            <main className="mx-auto max-w-6xl px-4 py-8">
                <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                    {/* LEFT */}
                    <section className="space-y-6">
                        {/* Player card */}
                        <div className="rounded-3xl border bg-card p-6 shadow-sm">
                            <div className="flex flex-wrap items-end justify-between gap-3">
                                <div>
                                    <div className="h-6 w-56 animate-pulse rounded bg-accent" />
                                    <div className="mt-2 h-4 w-40 animate-pulse rounded bg-accent" />
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <ButtonSkeleton w="w-32" />
                                    <ButtonSkeleton w="w-24" />
                                </div>
                            </div>

                            {/* Video skeleton */}
                            <div className="mt-4 overflow-hidden rounded-2xl border bg-black/10">
                                <div className="aspect-video w-full animate-pulse bg-accent" />
                            </div>
                        </div>

                        {/* Servers card */}
                        <div className="rounded-3xl border bg-card p-6 shadow-sm">
                            <div className="flex items-end justify-between gap-3">
                                <div>
                                    <div className="h-6 w-28 animate-pulse rounded bg-accent" />
                                    <div className="mt-2 h-4 w-52 animate-pulse rounded bg-accent" />
                                </div>
                                <div className="h-6 w-28 animate-pulse rounded-full border bg-card" />
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <ServerChipSkeleton key={i} />
                                ))}
                            </div>

                            <div className="mt-5 rounded-2xl border bg-card p-4">
                                <div className="h-3 w-40 animate-pulse rounded bg-accent" />
                                <div className="mt-2 h-4 w-28 animate-pulse rounded bg-accent" />
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <ButtonSkeleton w="w-28" />
                                    <div className="h-10 w-28 animate-pulse rounded-2xl bg-foreground/30" />
                                </div>
                            </div>

                            <div className="mt-5">
                                <div className="h-4 w-24 animate-pulse rounded bg-accent" />
                                <div className="mt-2 h-4 w-60 animate-pulse rounded bg-accent" />
                                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <DownloadRowSkeleton key={i} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Tips card */}
                        <div className="rounded-3xl border bg-card p-6 shadow-sm">
                            <div className="h-6 w-28 animate-pulse rounded bg-accent" />
                            <div className="mt-3 space-y-2">
                                <div className="h-4 w-full animate-pulse rounded bg-accent" />
                                <div className="h-4 w-10/12 animate-pulse rounded bg-accent" />
                            </div>
                        </div>
                    </section>

                    {/* RIGHT */}
                    <aside className="lg:sticky lg:top-20 h-fit space-y-6">
                        <div className="rounded-3xl border bg-card p-6 shadow-sm">
                            <div className="h-4 w-20 animate-pulse rounded bg-accent" />
                            <div className="mt-4 grid gap-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <StatSkeleton key={i} />
                                ))}
                            </div>

                            <div className="mt-5 flex gap-2">
                                <ButtonSkeleton w="w-full" />
                                <ButtonSkeleton w="w-full" />
                            </div>
                        </div>

                        <div className="rounded-3xl border bg-card p-6 shadow-sm">
                            <div className="h-4 w-20 animate-pulse rounded bg-accent" />
                            <div className="mt-3 grid gap-2">
                                <div className="h-10 w-full animate-pulse rounded-2xl bg-foreground/30" />
                                <div className="h-10 w-full animate-pulse rounded-2xl border bg-card" />
                            </div>
                        </div>
                    </aside>
                </div>

                <Footer />
            </main>
        </div>
    );
}
