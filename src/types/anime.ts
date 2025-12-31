export type RealAnimeType = "tv" | "movie" | "ova" | "special";
export type AnimeType = "Anime" | "Película" | "OVA" | "Especial";

export interface Anime{
    title: string,
    cover: string,
    synopsis: string,
    status: string,
    rating: string,
    genres: Array<string>,
    next_airing_episode?: string,
    episodes: Array<string>,
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
    status: string,
    rating: string,
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

