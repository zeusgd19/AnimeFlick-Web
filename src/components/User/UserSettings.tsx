'use client'

import { useState } from 'react'
import { useAuth } from '@/context/auth-context'

interface UserSettingsProps {
    currentEmail: string
    currentUsername: string
}

export default function UserSettings({ currentEmail, currentUsername }: UserSettingsProps) {
    const [loading, setLoading] = useState<string | null>(null)
    const [showEmailNotification, setShowEmailNotification] = useState(false)
    const { setUser, logout } = useAuth()

    const handleUpdateUsername = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const username = formData.get('username') as string

        if (!username.trim()) return

        setLoading('username')
        try {
            const res = await fetch('/api/auth/username', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username: username.trim() })
            })

            if (res.ok) {
                const data = await res.json()
                if (data.user) {
                    setUser(data.user)
                }
                window.location.href = `/${encodeURIComponent(username.trim())}`
            } else {
                const data = await res.json()
                alert(data.message || 'Error al actualizar nombre de usuario')
            }
        } catch (error) {
            alert('Error de red')
        } finally {
            setLoading(null)
        }
    }

    const handleUpdateEmail = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string

        if (!email.trim()) return

        setLoading('email')
        try {
            const res = await fetch('/api/auth/email', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email: email.trim() })
            })

            if (res.ok) {
                // Email change requires confirmation, don't update local state yet
                setShowEmailNotification(true)
            } else {
                const data = await res.json()
                alert(data.message || 'Error al actualizar email')
            }
        } catch (error) {
            alert('Error de red')
        } finally {
            setLoading(null)
        }
    }

    const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const newPassword = formData.get('newPassword') as string
        const confirmPassword = formData.get('confirmPassword') as string

        if (!newPassword || !confirmPassword) return
        if (newPassword !== confirmPassword) {
            alert('Las contraseñas no coinciden')
            return
        }

        setLoading('password')
        try {
            const res = await fetch('/api/auth/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ password: newPassword })
            })

            if (res.ok) {
                e.currentTarget.reset()
            } else {
                const data = await res.json()
                alert(data.message || 'Error al actualizar contraseña')
            }
        } catch (error) {
            console.error('Error de red', error)
        } finally {
            setLoading(null)
        }
    }

    const handleDeleteAccount = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const confirmation = formData.get('confirmation') as string

        if (confirmation !== 'DELETE') {
            alert('Debes escribir DELETE para confirmar la eliminación de la cuenta.')
            return
        }

        setLoading('delete')
        try {
            const res = await fetch('/api/auth/account', {
                method: 'DELETE',
                credentials: 'include',
            })

            if (res.ok) {
                alert('Cuenta eliminada correctamente.')
                await logout()
                window.location.href = '/'
            } else {
                const data = await res.json()
                alert(data.message || 'Error al eliminar la cuenta')
            }
        } catch (error) {
            console.error('Error de red', error)
        } finally {
            setLoading(null)
        }
    }

    return (
        <>
            {/* Change Username */}
            <section className="rounded-3xl border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold">Cambiar nombre de usuario</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Actualiza tu nombre de usuario. Debe ser único.
                </p>

                <form onSubmit={handleUpdateUsername} className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Nuevo nombre de usuario</label>
                        <input
                            type="text"
                            name="username"
                            defaultValue={currentUsername}
                            className="mt-1 block w-full rounded-2xl border bg-card px-3 py-2 text-sm"
                            placeholder="Ingresa tu nuevo nombre de usuario"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading === 'username'}
                        className="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
                    >
                        {loading === 'username' ? 'Actualizando...' : 'Cambiar nombre de usuario'}
                    </button>
                </form>
            </section>

            {/* Change Email */}
            <section className="rounded-3xl border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold">Cambiar email</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Actualiza tu dirección de email. Recibirás un enlace de verificación.
                </p>

                <form onSubmit={handleUpdateEmail} className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Nuevo email</label>
                        <input
                            type="email"
                            name="email"
                            defaultValue={currentEmail}
                            className="mt-1 block w-full rounded-2xl border bg-card px-3 py-2 text-sm"
                            placeholder="Ingresa tu nuevo email"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading === 'email'}
                        className="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
                    >
                        {loading === 'email' ? 'Actualizando...' : 'Cambiar email'}
                    </button>
                </form>
            </section>

            {/* Change Password */}
            <section className="rounded-3xl border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold">Cambiar contraseña</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Actualiza tu contraseña para mantener tu cuenta segura.
                </p>

                <form onSubmit={handleUpdatePassword} className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Nueva contraseña</label>
                        <input
                            type="password"
                            name="newPassword"
                            className="mt-1 block w-full rounded-2xl border bg-card px-3 py-2 text-sm"
                            placeholder="Ingresa una nueva contraseña"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Confirmar nueva contraseña</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="mt-1 block w-full rounded-2xl border bg-card px-3 py-2 text-sm"
                            placeholder="Confirma la nueva contraseña"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading === 'password'}
                        className="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
                    >
                        {loading === 'password' ? 'Actualizando...' : 'Cambiar contraseña'}
                    </button>
                </form>
            </section>

            {/* Delete Account */}
            <section className="rounded-3xl border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-red-600">Eliminar cuenta</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Esta acción es permanente. Todos tus datos serán eliminados.
                </p>

                <form onSubmit={handleDeleteAccount} className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Confirmación</label>
                        <input
                            type="text"
                            name="confirmation"
                            className="mt-1 block w-full rounded-2xl border bg-card px-3 py-2 text-sm"
                            placeholder="Escribe DELETE para confirmar"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading === 'delete'}
                        className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                    >
                        {loading === 'delete' ? 'Eliminando...' : 'Eliminar cuenta'}
                    </button>
                </form>
            </section>

        {/* Email Notification Modal */}
        {showEmailNotification && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="rounded-3xl border bg-card p-6 shadow-sm max-w-sm w-full text-center">
                    <h2 className="text-lg font-semibold mb-4">Correo Enviado</h2>
                    <p className="mb-4 text-sm text-muted-foreground">Se ha enviado un correo de confirmación a tu nueva dirección. Revísalo para completar el cambio.</p>
                    <button 
                        onClick={() => setShowEmailNotification(false)} 
                        className="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        )}
    </>
    )
}
