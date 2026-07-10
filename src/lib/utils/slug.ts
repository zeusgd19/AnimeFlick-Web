// src/lib/utils/slug.ts
// Base64 URL-safe encoding/decoding for anime slugs.
// Converts readable slugs like "one-piece-tv" into opaque tokens
// like "b25lLXBpZWNlLXR2" so they don't appear in the URL bar.

/**
 * Encode a readable slug into a Base64 URL-safe string.
 * Works in both Node.js (Buffer) and browser (btoa) environments.
 */
export function encodeSlug(slug: string): string {
    if (typeof Buffer !== "undefined") {
        return Buffer.from(slug, "utf-8")
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");
    }
    // Browser fallback
    return btoa(slug)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

/**
 * Decode a Base64 URL-safe string back into the original slug.
 * Returns the input unchanged if decoding fails (graceful fallback).
 */
export function decodeSlug(encoded: string): string {
    try {
        // Restore standard Base64 characters
        let b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
        // Add padding if needed
        const pad = b64.length % 4;
        if (pad) b64 += "=".repeat(4 - pad);

        if (typeof Buffer !== "undefined") {
            return Buffer.from(b64, "base64").toString("utf-8");
        }
        return atob(b64);
    } catch {
        // If decoding fails, assume it's already a plain slug (backwards compat)
        return encoded;
    }
}
