export interface Comment {
    id: number;
    user_id: string;
    display_name: string;
    episode_slug: string;
    content: string;
    created_at: string;
}

export interface CommentsResponse {
    comments: Comment[];
    message?: string;
}
