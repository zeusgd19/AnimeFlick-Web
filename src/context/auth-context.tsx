"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { AuthUser } from "@/types/user";

type AuthCtx = {
    user: AuthUser | null;
    setUser: (u: AuthUser | null) => void;
    logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({
                                 initialUser,
                                 children,
                             }: {
    initialUser: AuthUser | null;
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<AuthUser | null>(initialUser);

    async function logout() {
        await fetch("/api/auth/logout", { method: "POST" });
        setUser(null);
    }

    const value = useMemo(() => ({ user, setUser, logout }), [user]);

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
    const v = useContext(Ctx);
    if (!v) throw new Error("useAuth must be used inside <AuthProvider />");
    return v;
}
