import {AuthBody} from "@/types/user";
import {cookies} from "next/headers";
import {ProgressAnimeResponse} from "@/types/anime";


function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, ms = 8000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ms);

    return fetch(input, {
        ...init,
        signal: controller.signal,
    }).finally(() => clearTimeout(timeout));
}

type FetchJsonOptions = RequestInit & { timeoutMs?: number };

async function strictJsonFetch<T>(url: string, opts: FetchJsonOptions = {}): Promise<T> {
    const { timeoutMs = 8000, ...init } = opts;
    const res = await fetchWithTimeout(url, init, timeoutMs);

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} :: ${url} :: ${text.slice(0, 160)}`);
    }

    return (await res.json()) as T;
}

async function safeJsonFetch<T>(url: string, opts: FetchJsonOptions = {}): Promise<T | null> {
    try {
        return await strictJsonFetch<T>(url, opts);
    } catch (e) {
        console.warn("[safeJsonFetch] failed:", url, e);
        return null;
    }
}

export async function SignUpUser(authBody: AuthBody){
    const base = process.env.EXTERNAL_USER_API_BASE!

    const url = `${base}/auth/signup`;

    return safeJsonFetch<any>(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authBody),
        next: { revalidate: 300 },
        timeoutMs: 8000,
    });
}

export async function fetchProgress(status: string): Promise<ProgressAnimeResponse> {
    const base = process.env.EXTERNAL_USER_API_BASE;
    if (!base) throw new Error("Missing EXTERNAL_USER_API_BASE");

    const token = (await cookies()).get("af_access")?.value;
    if (!token) throw new Error("NO_AUTH");

    const url = `${base}/anime/progress?status=${encodeURIComponent(status)}`;

    return safeJsonFetch<any>(url,{
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
        cache: "no-store"
    })
}