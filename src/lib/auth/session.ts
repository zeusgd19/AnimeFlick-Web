import "server-only";
import { cookies } from "next/headers";
import type { AuthUser } from "@/types/user";

export async function getCurrentUser(): Promise<AuthUser | null> {
    const raw = (await cookies()).get("af_user")?.value;
    if (!raw) return null;

    try {
        return JSON.parse(raw) as AuthUser;
    } catch {
        return null;
    }
}
