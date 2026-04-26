import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import TicketForm from "@/components/Soporte/TicketForm";
import { LifeBuoy, Mail, MessageSquare } from "lucide-react";

export const metadata = {
    title: "Soporte | AnimeFlick",
    description: "Envía un ticket de soporte o reporte a AnimeFlick.",
};

export default function SoportePage() {
    return (
        <div className="min-h-dvh bg-background flex flex-col">
            <Header />

            <main className="flex-grow mx-auto max-w-5xl px-4 py-12 w-full">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                        <LifeBuoy size={32} />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
                        Centro de <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Soporte</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        ¿Tienes algún problema con un episodio, una sugerencia o inconvenientes con tu cuenta? 
                        Envíanos un ticket y te ayudaremos lo más rápido posible.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Información adicional */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-card border rounded-3xl p-6 shadow-sm">
                            <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
                                <MessageSquare size={20} className="text-primary" />
                                Tiempos de Respuesta
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Nuestro equipo revisa los tickets diariamente. Por lo general, recibirás una respuesta o verás tu problema solucionado en un plazo de 24 a 48 horas.
                            </p>
                        </div>
                        
                        <div className="bg-card border rounded-3xl p-6 shadow-sm">
                            <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
                                <Mail size={20} className="text-primary" />
                                Contacto Directo
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Si el problema es urgente, también puedes escribirnos directamente a nuestro correo de administración.
                            </p>
                            <a href="mailto:soporte@animeflick.com" className="inline-flex text-sm font-medium text-foreground hover:text-primary transition">
                                soporte@animeflick.com →
                            </a>
                        </div>
                    </div>

                    {/* Formulario */}
                    <div className="lg:col-span-2">
                        <TicketForm />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
