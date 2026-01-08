import {AuthBody} from "@/types/user";


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