/**
 * Archivo: not-found.tsx (Raíz)
 * Descripción: Página de error 404 personalizada.
 * Se renderiza automáticamente cuando Next.js no encuentra una ruta coincidente.
 */
"use client";

import { useRouter } from "next/navigation";
import { Button } from "./components/ui/button";
import { Home } from "lucide-react";
/**
 * Componente NotFound: Proporciona una interfaz amigable cuando el usuario
 * accede a una URL rota o inexistente, permitiendo el retorno rápido al inicio.
 */
export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Página no encontrada</h2>
        <p className="text-xl text-gray-600 mb-8">La página que buscas no existe o ha sido movida</p>

        <Button size="lg" onClick={() => router.push("/")} className="gap-2">
          <Home className="w-5 h-5" />
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}