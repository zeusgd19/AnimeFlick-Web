'use client'

import { useEffect, useState } from 'react'

interface StatsData {
  total_episodes_watched: number
  total_completed: number
  total_favorites: number
  last_episode_watched: {
    episode_slug: string
    created_at: string
  }
  last_anime_added: {
    anime_id: string
    list: string
    created_at: string
  }
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  )
}

export default function ProfileStats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/auth/stats', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        } else {
          setError('Error loading stats')
        }
      } catch (err) {
        setError('Error loading stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <>
        {/* Stats */}
        <section className="rounded-3xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Estadísticas</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
            <Stat label="Animes vistos" value="Cargando..." />
            <Stat label="Episodios vistos" value="Cargando..." />
            <Stat label="Favoritos" value="Cargando..." />
          </div>
        </section>

        {/* Recent Activity Placeholder */}
        <section className="rounded-3xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Actividad reciente</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Cargando actividad...
          </p>
        </section>
      </>
    )
  }

  if (error || !stats) {
    return (
      <>
        {/* Stats */}
        <section className="rounded-3xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Estadísticas</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
            <Stat label="Animes vistos" value="Error" />
            <Stat label="Episodios vistos" value="Error" />
            <Stat label="Favoritos" value="Error" />
          </div>
        </section>

        {/* Recent Activity Placeholder */}
        <section className="rounded-3xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Actividad reciente</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Error cargando actividad.
          </p>
        </section>
      </>
    )
  }

  return (
    <>
      {/* Stats */}
      <section className="rounded-3xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Estadísticas</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
          <Stat label="Animes completados" value={stats.total_completed} />
          <Stat label="Episodios vistos" value={stats.total_episodes_watched} />
          <Stat label="Favoritos" value={stats.total_favorites} />
        </div>
      </section>

      {/* Recent Activity */}
      <section className="rounded-3xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Actividad reciente</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Últimos animes vistos o listas actualizadas.
        </p>
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border bg-card p-3">
            <p className="text-sm">Vio el episodio {stats.last_episode_watched.episode_slug}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(stats.last_episode_watched.created_at).toLocaleDateString('es-ES')}
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-3">
            <p className="text-sm">Añadió {stats.last_anime_added.anime_id} a {stats.last_anime_added.list}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(stats.last_anime_added.created_at).toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
