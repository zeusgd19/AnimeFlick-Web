export type ProgressStatus = "watching" | "completed" | "paused" | "none";

export interface ProgressBody {
    anime_slug: string;
    title: string;
    cover: string;
    rating: string;
    type: string;
    status: ProgressStatus;
}

export interface ProgressInsertResponse {
    id: number;
    user_id: string;
    anime_slug: string;
    created_at: string;
}

export interface ProgressAddWrapper {
    message: string;
    data: ProgressInsertResponse[];
}
