import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { subject, email, category, message } = body;

        if (!email || !message || !category) {
            return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
        }

        if (!process.env.BREVO_API_KEY) {
            console.error("BREVO_API_KEY is not set");
            return NextResponse.json({ error: "Error de configuración del servidor" }, { status: 500 });
        }

        const htmlContent = `
            <h2>Nuevo Ticket de Soporte</h2>
            <p><strong>De:</strong> ${email}</p>
            <p><strong>Categoría:</strong> ${category}</p>
            <p><strong>Asunto:</strong> ${subject}</p>
            <hr />
            <p><strong>Mensaje:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
        `;

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: "AnimeFlick Soporte", email: "soporte@animeflick.com" },
                to: [{ email: "dariusgd19@gmail.com", name: "Admin" }],
                replyTo: { email: email },
                subject: `[Ticket: ${category}] ${subject || "Sin Asunto"}`,
                htmlContent: htmlContent
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error from Brevo API:", errorData);
            return NextResponse.json({ error: "Error al enviar el ticket por SMTP" }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Ticket enviado correctamente" });
    } catch (error: any) {
        console.error("Error sending ticket:", error);
        return NextResponse.json({ error: "Error interno al enviar el ticket" }, { status: 500 });
    }
}
