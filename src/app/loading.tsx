import Header from "@/components/Header/header";
import {SkeletonGrid} from "@/components/ui/Skeletons/skeletons";

export default function Loading() {
    return (
        <div className="min-h-dvh bg-background">
            <Header />
            <main className="mx-auto max-w-6xl px-4 py-6">
                <div className="rounded-3xl border bg-card p-6">
                    <div className="h-8 w-1/2 animate-pulse rounded bg-accent" />
                    <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-accent" />
                </div>

                <section className="mt-10">
                    <div className="h-6 w-52 animate-pulse rounded bg-accent" />
                    <SkeletonGrid count={10} />
                </section>
            </main>
        </div>
    );
}
