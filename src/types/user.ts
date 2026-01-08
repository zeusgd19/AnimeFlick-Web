export interface SupabaseUser {
    id: string | null,
    email?: string | null,
    phone?: string | null,
    display_name?: string | null,
    user_metadata?: SupabaseMetadataUser | null
}

export interface SupabaseMetadataUser {
    display_name?: string | null
}

export interface AuthBody {
    email: string,
    password: string,
    display_name?: string | null
}

export interface SignUpResponse {
    message?: string | null,
    access_token?: string | null,
    refresh_token?: string | null,
    user?: SupabaseUser | null
}

export type SignInResponse = {
    access_token?: string | null;
    refresh_token?: string | null;
    token_type?: string | null;
    expires_in?: number | null;
    user?: SupabaseUser | null;
    status?: string | null; // "complete" por ejemplo
};

export type AuthUser = {
    id: string;
    email?: string | null;
    display_name?: string | null;
};