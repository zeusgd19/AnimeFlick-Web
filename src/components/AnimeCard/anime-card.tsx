import {CardAnime, AnimeOnAirComplete, FilteredAnime, RecentEpisode} from "@/types/anime";
import Link from "next/link";
import {FavoriteAnime} from "@/lib/utils/favorite";
import AddToProgressMenu from "@/components/Me/add-to-progress-menu";

type InputAnime = AnimeOnAirComplete | FilteredAnime | RecentEpisode;

function toCardAnime(anime: InputAnime): CardAnime {
    if ("number" in anime) {
        // RecentEpisode
        return { kind: "recent", title: anime.title, slug: anime.slug, cover: anime.cover, number: anime.number };
    }

    if ("anime" in anime) {
        // AnimeOnAirComplete
        return { kind: "onAir", title: anime.anime.title, slug: anime.anime.slug, cover: anime.cover, type: anime.anime.type };
    }


    // FilteredAnime
    return {
        kind: "filtered",
        title: anime.title,
        slug: anime.slug,
        cover: anime.cover,
        type: anime.type,
        rating: anime.rating,
        synopsis: anime.synopsis,
    };
}

export default function AnimeCard({ anime }: { anime: InputAnime }) {
    const card = toCardAnime(anime);

    const href = card.kind === "recent" ? `/watch/${card.slug}` : `/anime/${card.slug}`;
    const primaryLabel = card.kind === "recent" ? "Ver" : "Detalles";
    const secondaryLabel = card.kind === "recent" ? "Visto" : "+ Lista";

    return (
        <div className="group rounded-2xl border bg-card overflow-hidden shadow-sm transition hover:shadow-md">
            <div className="relative overflow-hidden">
                <img
                    src={card.cover}
                    alt={card.title}
                    className="block w-full h-auto object-contain bg-black/5 transition duration-300 group-hover:scale-[1.01]"
                />

                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                    <h3 className="line-clamp-2 text-sm font-semibold text-white">{card.title}</h3>

                    {/* Extras según tipo (sin returns distintos) */}
                    {card.kind === "filtered" ? (
                        <div className="mt-1 flex gap-2">
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs text-white">
                {card.type}
              </span>
                            <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs text-white">
                ⭐ {card.rating}
              </span>
                        </div>
                    ) : null}

                    {card.kind === "onAir" ? (
                        <div className="mt-1">
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs text-white">
                En emisión · {card.type}
              </span>
                        </div>
                    ) : null}
                </div>

                <div className="absolute inset-x-3 bottom-14 hidden gap-2 group-hover:flex">
                    <Link
                        href={href}
                        className="flex-1 rounded-xl bg-white/90 px-3 py-2 text-center text-sm font-medium text-black backdrop-blur hover:bg-white"
                    >
                        {primaryLabel}
                    </Link>
                    {card.kind === "filtered" && (
                        <AddToProgressMenu anime={{
                            anime_slug: card.slug,
                            title: card.title,
                            cover: card.cover,
                            rating: card.rating,
                            type: card.type
                        }}
                                           triggerLabel={secondaryLabel}
                                           triggerClassName="rounded-xl bg-black/70 px-3 py-2 text-sm font-medium text-white backdrop-blur hover:bg-black/80"
                        />
                        )}
                </div>
            </div>

            <div className="p-3">
                {card.kind === "recent" ? (
                    <span className="text-xs text-muted-foreground">Episodio {card.number}</span>
                ) : card.kind === "filtered" ? (
                    <p className="line-clamp-2 text-xs text-muted-foreground">{card.synopsis}</p>
                ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                )}
            </div>
        </div>
    );
}

export  function AnimeFavoriteCard({ anime }: { anime: FavoriteAnime }) {

    const href = `/anime/${anime.slug}`;
    const primaryLabel = "Detalles";
    const secondaryLabel= "+ Lista";

    return (
        <div className="group rounded-2xl border bg-card overflow-hidden shadow-sm transition hover:shadow-md">
            <div className="relative overflow-hidden">
                <img
                    src={anime.cover}
                    alt={anime.title}
                    className="block w-full h-auto object-contain bg-black/5 transition duration-300 group-hover:scale-[1.01]"
                />

                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                    <h3 className="line-clamp-2 text-sm font-semibold text-white">{anime.title}</h3>

                    {/* Extras según tipo (sin returns distintos) */}
                        <div className="mt-1 flex gap-2">
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs text-white">
                {anime.type}
              </span>
                            <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs text-white">
                ⭐ {anime.rating}
              </span>
                        </div>


                <div className="absolute inset-x-3 bottom-14 hidden gap-2 group-hover:flex">
                    <Link
                        href={href}
                        className="flex-1 rounded-xl bg-white/90 px-3 py-2 text-center text-sm font-medium text-black backdrop-blur hover:bg-white"
                    >
                        {primaryLabel}
                    </Link>
                    <AddToProgressMenu anime={{
                        anime_slug: anime.slug,
                        title: anime.title,
                        cover: anime.cover,
                        rating: anime.rating,
                        type: anime.type
                    }}
                    triggerLabel={secondaryLabel}
                   triggerClassName="rounded-xl bg-black/70 px-3 py-2 text-sm font-medium text-white backdrop-blur hover:bg-black/80"
                    />
                </div>
            </div>
            </div>
        </div>
    );
}