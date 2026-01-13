export interface FavoriteBody {
    anime_slug: string,
    title: string,
    cover: string,
    rating: string,
    type: string,
}

export interface DeleteFavoriteBody {
    anime_slug: string,
}