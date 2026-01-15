import Link from "next/link";

function hrefWithPage(basePath: string, query: Record<string, any>, page: number) {
    const params = new URLSearchParams();

    Object.entries(query).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;

        if (Array.isArray(v)) {
            v.forEach((item) => {
                if (item === undefined || item === null || item === "") return;
                params.append(k, String(item));
            });
            return;
        }

        params.set(k, String(v));
    });

    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
}

function pageRange(current: number, total: number) {
    const delta = 2;
    const pages: (number | "...")[] = [];

    const left = Math.max(1, current - delta);
    const right = Math.min(total, current + delta);

    if (left > 1) pages.push(1);
    if (left > 2) pages.push("...");

    for (let p = left; p <= right; p++) pages.push(p);

    if (right < total - 1) pages.push("...");
    if (right < total) pages.push(total);

    return pages;
}

export function Pagination({
                               basePath,
                               query,
                               data,
                           }: {
    basePath: string;
    query: Record<string, any>;
    data: { currentPage: number; foundPages: number; hasNextPage: boolean };
}) {
    const current = data.currentPage;
    const total = data.foundPages;

    if (total <= 1) return null;

    const hasPrev = current > 1;
    const hasNext = data.hasNextPage;

    const pages = pageRange(current, total);

    return (
        <nav className="mt-8 flex items-center justify-center gap-2">
            {/* Prev */}
            {hasPrev ? (
                <Link
                    href={hrefWithPage(basePath, query, current - 1)}
                    prefetch
                    scroll={false}
                    className="rounded-xl border bg-card px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                    ←
                </Link>
            ) : (
                <span className="rounded-xl border bg-card px-3 py-2 text-sm font-medium opacity-40">←</span>
            )}

            {/* Numbers */}
            {pages.map((p, i) =>
                p === "..." ? (
                    <span key={`dots-${i}`} className="px-2 text-sm text-muted-foreground">…</span>
                ) : (
                    <Link
                        key={p}
                        prefetch
                        href={hrefWithPage(basePath, query, p)}
                        scroll={false}
                        className={[
                            "rounded-xl border px-3 py-2 text-sm font-medium",
                            p === current ? "bg-foreground text-background" : "bg-card hover:bg-accent",
                        ].join(" ")}
                    >
                        {p}
                    </Link>
                )
            )}

            {/* Next */}
            {hasNext ? (
                <Link
                    href={hrefWithPage(basePath, query, current + 1)}
                    prefetch
                    scroll={false}
                    className="rounded-xl border bg-card px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                    →
                </Link>
            ) : (
                <span className="rounded-xl border bg-card px-3 py-2 text-sm font-medium opacity-40">→</span>
            )}
        </nav>
    );
}
