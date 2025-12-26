export default function SearchMobile() {
    return (
        <div className="mx-auto max-w-6xl px-4 pb-3 md:hidden">
            <div className="flex items-center rounded-2xl border bg-card px-3 py-2">
                <span className="text-muted-foreground">⌕</span>
                <input
                    className="w-full bg-transparent px-2 text-sm outline-none"
                    placeholder="Busca anime…"
                />
            </div>
        </div>
    )
}