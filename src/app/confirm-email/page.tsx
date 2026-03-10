import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Correo Confirmado',
}

export default function ConfirmEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">¡Correo Confirmado!</h1>
        <p className="text-gray-700 mb-6">Tu dirección de correo electrónico ha sido confirmada exitosamente.</p>
        <a href="/" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Ir al Inicio
        </a>
      </div>
    </div>
  )
}
