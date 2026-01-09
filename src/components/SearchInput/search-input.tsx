"use client";
import {useRouter} from "next/navigation";
import {useState} from "react";

export default function SearchInput() {
    const router = useRouter();
    const [query, setQuery] = useState("");

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== "Enter") return;

        const q = query.trim();
        if (!q) return;

        router.push(`/search?q=${encodeURIComponent(q)}`);
    };

    return (
        <div className="mx-auto hidden w-full max-w-xl md:block">
            <div className="flex items-center rounded-2xl border bg-card px-3 py-2">
                <span className="text-muted-foreground">⌕</span>
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent px-2 text-sm outline-none"
                    placeholder="Busca anime, estudio, género…"
                />
            </div>
        </div>
    )
}