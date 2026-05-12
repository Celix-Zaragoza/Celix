/**
 * Archivo: frontend/app/auth/create-profile-2/page.tsx
 * Descripción: Punto de entrada de la página del Paso 2 de creación de perfil.
 * Implementa Suspense para manejar de forma segura el hook useSearchParams() del componente cliente.
 */
import { Suspense } from "react";
import CreateProfile2Client from "./CreateProfile2Client";
/**
 * Componente de servidor que envuelve al cliente en un límite de Suspense.
 * En Next.js (App Router), el uso de useSearchParams() requiere Suspense durante la
 * renderización estática para evitar errores en el tiempo de compilación.
 */
export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center px-4 py-12">Cargando...</div>}>
      <CreateProfile2Client />
    </Suspense>
  );
}