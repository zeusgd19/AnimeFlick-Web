import { AuthTokens } from "./cookies";

const USER_API = process.env.EXTERNAL_USER_API_BASE!; // https://zeusgd19.pythonanywhere.com

export async function refreshWithBackend(refreshToken: string): Promise<AuthTokens> {
    const res = await fetch(`${USER_API}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
        cache: "no-store",
    });

    if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`REFRESH_FAILED ${res.status} ${t}`.trim());
    }

    const json = await res.json();
    // json: { access_token, refresh_token, token_type, expires_in, user }
    return {
        access_token: json.access_token,
        refresh_token: json.refresh_token,
        expires_in: json.expires_in ?? null,
    };
}
