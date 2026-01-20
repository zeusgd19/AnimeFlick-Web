import { NextResponse } from "next/server";
import { getAuthFromCookies, isExpired, setAuthCookies } from "./cookies";
import { refreshWithBackend } from "./refresh";

export async function ensureFreshAccessToken() {
    const { access, refresh, expiresAt } = await getAuthFromCookies();

    // No hay refresh => no puedes refrescar
    if (!refresh) return { access: access ?? null, refreshed: false, response: null as NextResponse | null };

    // Si hay access y NO está caducado => ok
    if (access && !isExpired(expiresAt)) {
        return { access, refreshed: false, response: null as NextResponse | null };
    }

    // Si está caducado (o no hay access) => refresh
    const tokens = await refreshWithBackend(refresh);

    // Creamos respuesta para poder setear cookies (y luego la reusamos si quieres)
    const res = NextResponse.next();
    setAuthCookies(res, tokens);

    return { access: tokens.access_token, refreshed: true, response: res };
}
