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

/** Normalize a slug for comparison (lowercase + alphanumeric characters only) */
export function normSlug(s: string): string {
    return (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Calculate Levenshtein distance between two normalized strings */
export function levenshteinDistance(a: string, b: string): number {
    if (a === b) return 0;
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

/** Check if two anime slugs match (exact, normalized, or fuzzy typo match) */
export function isSlugMatch(slugA: string, slugB: string): boolean {
    if (!slugA || !slugB) return false;
    if (slugA === slugB) return true;

    const normA = normSlug(slugA);
    const normB = normSlug(slugB);
    if (normA === normB) return true;

    const lenDiff = Math.abs(normA.length - normB.length);
    if (lenDiff > 3) return false;

    const minLen = Math.min(normA.length, normB.length);
    if (minLen < 5) return false;

    const dist = levenshteinDistance(normA, normB);

    if (minLen < 9) {
        // For short names (5-8 chars), only allow 1 insertion/deletion (lenDiff === 1) to avoid matching different names like naruto vs boruto
        return lenDiff === 1 && dist <= 1;
    }
    if (minLen <= 15) {
        return dist <= 1 || (lenDiff <= 2 && dist <= 2);
    }
    return dist <= 3;
}

/** Check if two episode slugs match (e.g. "one-piece-1060" vs "onepiece-1060") */
export function isEpisodeSlugMatch(epSlugA: string, epSlugB: string): boolean {
    if (!epSlugA || !epSlugB) return false;
    if (epSlugA === epSlugB) return true;

    const mA = epSlugA.match(/^(.*?)-(\d+)$/);
    const mB = epSlugB.match(/^(.*?)-(\d+)$/);

    if (mA && mB) {
        // Compare episode numbers first
        if (mA[2] !== mB[2]) return false;
        // Compare anime slugs using fuzzy matching
        return isSlugMatch(mA[1], mB[1]);
    }

    return isSlugMatch(epSlugA, epSlugB);
}
