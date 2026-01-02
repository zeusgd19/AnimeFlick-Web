import Link from "next/link";

export default function Footer() {
    return (
        <footer className="mt-14 border-t py-8 text-sm text-muted-foreground">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p>© {new Date().getFullYear()} AnimeFlick</p>
                <div className="flex gap-4">
                    <Link href="/legal" className="hover:text-foreground">
                        Legal
                    </Link>
                    <Link href="/privacy" className="hover:text-foreground">
                        Privacidad
                    </Link>
                    <Link href="/about" className="hover:text-foreground">
                        Acerca de
                    </Link>
                </div>
            </div>
        </footer>
    )
}