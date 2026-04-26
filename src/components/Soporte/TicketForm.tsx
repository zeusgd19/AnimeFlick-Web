"use client";

import { useState, useEffect } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2, Lock } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";

export default function TicketForm() {
    const { user } = useAuth();
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [formData, setFormData] = useState({
        email: user?.email || "",
        category: "Error de Video",
        subject: "",
        message: ""
    });

    useEffect(() => {
        if (user?.email) {
            setFormData(prev => ({ ...prev, email: user.email ?? "" }));
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");

        try {
            const res = await fetch("/api/tickets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setStatus("success");
                setFormData({ email: "", category: "Error de Video", subject: "", message: "" });
            } else {
                setStatus("error");
            }
        } catch (error) {
            setStatus("error");
        }
    };

    if (status === "success") {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-card rounded-3xl border border-green-500/20 shadow-lg">
                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-2">¡Ticket Enviado!</h3>
                <p className="text-muted-foreground mb-6">Hemos recibido tu mensaje correctamente. Nuestro equipo lo revisará y te responderá al correo electrónico proporcionado lo antes posible.</p>
                <button 
                    onClick={() => setStatus("idle")}
                    className="px-6 py-2 bg-foreground text-background rounded-2xl font-medium hover:opacity-90 transition"
                >
                    Enviar otro ticket
                </button>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-card rounded-3xl border shadow-sm h-full min-h-[400px]">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                    <Lock size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-2">Inicio de sesión requerido</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                    Para evitar spam y poder ayudarte mejor, necesitamos que inicies sesión en tu cuenta de AnimeFlick antes de abrir un ticket de soporte.
                </p>
                <Link 
                    href="/login"
                    className="px-6 py-3 bg-foreground text-background rounded-2xl font-medium hover:opacity-90 transition shadow-md"
                >
                    Iniciar Sesión
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-card rounded-3xl border shadow-sm p-6 sm:p-8 relative overflow-hidden">
            {/* Gradiente de fondo sutil */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 space-y-6">
                {status === "error" && (
                    <div className="flex items-center gap-3 p-4 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20">
                        <AlertCircle size={20} />
                        <span className="text-sm font-medium">Ocurrió un error al enviar el ticket. Por favor, inténtalo de nuevo más tarde.</span>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-semibold ml-1 flex items-center gap-2">
                            Correo Electrónico
                            {user && <Lock size={14} className="text-muted-foreground" />}
                        </label>
                        <input 
                            required
                            type="email" 
                            id="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            readOnly={!!user}
                            placeholder="tu@email.com" 
                            className={`w-full bg-background border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm ${user ? 'opacity-70 cursor-not-allowed bg-muted' : ''}`}
                        />
                        {user && <p className="text-xs text-muted-foreground ml-1">Autocompletado con tu cuenta actual.</p>}
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="category" className="text-sm font-semibold ml-1">Categoría</label>
                        <select 
                            id="category" 
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full bg-background border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm appearance-none"
                        >
                            <option>Error de Video</option>
                            <option>Sugerencia de Anime</option>
                            <option>Problema con mi Cuenta</option>
                            <option>Otro</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-semibold ml-1">Asunto</label>
                    <input 
                        type="text" 
                        id="subject" 
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Ej: El episodio 4 de Naruto no carga" 
                        className="w-full bg-background border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-semibold ml-1">Mensaje</label>
                    <textarea 
                        id="message" 
                        name="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Describe tu problema con el mayor detalle posible..." 
                        className="w-full bg-background border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm resize-none"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={status === "loading"}
                    className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-3 rounded-2xl font-semibold hover:opacity-90 transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {status === "loading" ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Enviando...
                        </>
                    ) : (
                        <>
                            <Send size={18} />
                            Enviar Ticket
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
