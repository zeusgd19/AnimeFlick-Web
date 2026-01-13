"use client";

import { Heart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
    addFavoriteRemote,
    ensureFavoritesSynced,
    isFavorite,
    removeFavoriteRemote,
    removeFavoriteLocal,
    upsertFavoriteLocal,
    type FavoriteAnime,
} from "@/lib/utils/favorite";

export default function AddToFavorite({ anime }: { anime: FavoriteAnime }) {
    const router = useRouter();
    const pathname = usePathname();
    const nextUrl = useMemo(() => encodeURIComponent(pathname), [pathname]);

    const [fav, setFav] = useState(false);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        (async () => {
            await ensureFavoritesSynced(false);
            setFav(isFavorite(anime.slug));
        })();
    }, [anime.slug]);

    async function onToggle() {
        if (busy) return;
        setBusy(true);

        const next = !fav;

        // ✅ Optimista en local
        if (next) upsertFavoriteLocal(anime);
        else removeFavoriteLocal(anime.slug);

        setFav(next);

        try {
            const res = next
                ? await addFavoriteRemote(anime)
                : await removeFavoriteRemote(anime.slug);

            if (res.status === 401) {
                // rollback local
                if (next) removeFavoriteLocal(anime.slug);
                else upsertFavoriteLocal(anime);
                setFav(!next);

                router.push(`/login?next=${nextUrl}`);
                return;
            }

            if (!res.ok) {
                // rollback local
                if (next) removeFavoriteLocal(anime.slug);
                else upsertFavoriteLocal(anime);
                setFav(!next);
            }
        } catch {
            // rollback local
            if (next) removeFavoriteLocal(anime.slug);
            else upsertFavoriteLocal(anime);
            setFav(!next);
        } finally {
            setBusy(false);
        }
    }

    return (
        <button
            type="button"
            onClick={onToggle}
            disabled={busy}
            className={[
                "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition cursor-pointer",
                fav
                    ? "bg-foreground text-background hover:opacity-90"
                    : "border bg-card hover:bg-accent",
                busy ? "opacity-70 cursor-not-allowed" : "",
            ].join(" ")}
            title={fav ? "Quitar de favoritos" : "Añadir a Favoritos"}
        >
            <Heart className={["h-4 w-4", fav ? "fill-current" : ""].join(" ")} />
            {fav ? "En favoritos" : " Añadir a Favoritos"}
        </button>
    );
}
