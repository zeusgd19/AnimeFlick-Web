export type Provider = "streamwish" | "stape" | "unknown";

export function detectProvider(url: string): Provider {
    try {
        const host = new URL(url).hostname.toLowerCase();
        if (host.includes("streamwish")) return "streamwish";
        if (host.includes("streamtape") || host.includes("stape") || host.includes("streamta")) return "stape";
        return "unknown";
    } catch {
        return "unknown";
    }
}