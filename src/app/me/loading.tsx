import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import { SkeletonGrid } from "@/components/ui/Skeletons/skeletons";

function BadgeSkeleton() {
    return <div className="h-6 w-24 animate-pulse rounded-full bg-accent" />;
}

export default function Loading() {
    return (
        <div className="min-h-dvh bg-background">
            <Header />

            {/* Hero skeleton */}
            <section className="relative overflow-hidden border-b">
                <div className="absolute inset-0">
                    <div className="h-full w-full bg-accent" />
                    <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/80 to-background" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
                </div>

                <div className="relative mx-auto max-w-6xl px-4 py-8 md:py-10">
                    <div className="h-4 w-64 animate-pulse rounded bg-accent" />
                    <div className="mt-4 flex flex-wrap gap-2">
                        <BadgeSkeleton />
                        <BadgeSkeleton />
                        <BadgeSkeleton />
                    </div>

                    <div className="mt-4 h-10 w-72 animate-pulse rounded bg-accent" />
                    <div className="mt-3 h-4 w-[520px] max-w-full animate-pulse rounded bg-accent" />
                </div>
            </section>

            <main className="mx-auto max-w-6xl px-4 py-8">
                <section className="rounded-3xl border bg-card p-6 shadow-sm">
                    <div className="flex items-end justify-between gap-3">
                        <div>
                            <div className="h-6 w-44 animate-pulse rounded bg-accent" />
                            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-accent" />
                        </div>
                        <div className="h-6 w-28 animate-pulse rounded-full bg-accent" />
                    </div>

                    <div className="mt-6">
                        <SkeletonGrid count={20} />
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-2">
                        <div className="h-10 w-10 animate-pulse rounded-xl bg-accent" />
                        <div className="h-10 w-10 animate-pulse rounded-xl bg-accent" />
                        <div className="h-10 w-10 animate-pulse rounded-xl bg-accent" />
                        <div className="h-10 w-10 animate-pulse rounded-xl bg-accent" />
                        <div className="h-10 w-10 animate-pulse rounded-xl bg-accent" />
                    </div>
                </section>

                <Footer />
            </main>
        </div>
    );
}
