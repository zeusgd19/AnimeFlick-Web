export type RealAnimeType = "tv" | "movie" | "ova" | "special";
export type AnimeType = "Anime" | "Película" | "OVA" | "Especial";
export type CardAnime =
    | { kind: "recent"; title: string; slug: string; cover: string; number: number }
    | { kind: "onAir"; title: string; slug: string; cover: string; type: AnimeType }
    | { kind: "filtered"; title: string; slug: string; cover: string; type: AnimeType; rating: string; synopsis: string };

export interface Anime{
    title: string,
    alternative_titles: Array<string>,
    cover: string,
    synopsis: string,
    type: AnimeType,
    status: string,
    rating: string,
    genres: Array<string>,
    next_airing_episode?: string,
    episodes: Array<Episode>,
    url: string,
    related: RelatedAnime[]
}

export type ProgressAnimeResponse = {
    message?: string | null;
    animes: FilteredAnime[];
};

export interface Episode {
    number: number,
    slug: string,
    url: string
}

export interface ServerEpisode {
    name: string,
    download?: string,
    embed?: string
}

export interface ServerEpisodeData {
    title: string,
    number: number,
    servers: ServerEpisode[]
}

export interface RelatedAnime {
    title: string,
    relation: string,
    slug: string,
    url: string
}


export interface RecentEpisode{
    title: string,
    number: number,
    cover: string,
    slug: string
}

export interface FilteredAnime{
    title: string,
    cover: string,
    synopsis: string,
    rating: string,
    slug: string,
    type: AnimeType,
    url: string
}

export interface FilteredAnimeData {
    currentPage: number,
    hasNextPage: boolean,
    previousPage: string,
    nextPage: string,
    foundPages: number,
    media: FilteredAnime[]
}

export interface AnimeOnAir{
    title: string,
    type: AnimeType,
    slug: string,
    url: string
}

export interface AnimeOnAirComplete{
    anime: AnimeOnAir,
    cover: string
}

export interface AnimeResponse {
    data: Anime
}

export interface AnimesOnAirResponse {
    data: AnimeOnAir[]
}

export interface AnimeRecentEpisodeResponse{
    data: RecentEpisode[],
}

export interface FilteredAnimesResponse {
    data: FilteredAnimeData
}

export interface ServerEpisodeResponse {
    data: ServerEpisodeData,
}

