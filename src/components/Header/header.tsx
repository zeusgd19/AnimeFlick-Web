import Link from "next/link";
import SearchMobile from "@/components/SearchInput/SearchMobile/search-mobile";
import SearchInput from "@/components/SearchInput/search-input";
import LogoutAndLoginButton from "@/components/Auth/logout-and-login-button";
import {getCurrentUser} from "@/lib/auth/session";

export default async function Header(){
    const user = await getCurrentUser();

    return (
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <img src="/logo_a.png" className="inline-flex h-14 w-14 items-center justify-center rounded-xl"/>
                    <p className="text-xl">AnimeFlick</p>
                </Link>

                <SearchInput></SearchInput>

                <nav className="ml-auto flex items-center gap-2">
                    <Link
                        href="/search"
                        className="rounded-xl border px-3 py-2 text-sm font-medium hover:bg-accent"
                    >
                        Explorar
                    </Link>
                    {user ? (
                        <Link
                            href="/me"
                            className="hidden rounded-xl border px-3 py-2 text-sm font-medium hover:bg-accent sm:inline-flex"
                        >
                            Mis listas
                        </Link>
                    ): null}
                    <LogoutAndLoginButton></LogoutAndLoginButton>
                </nav>
            </div>

            {/* Search mobile */}
            <SearchMobile></SearchMobile>
        </header>
    )
}