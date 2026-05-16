/**
 * Archivo: frontend/app/auth/create-profile-1/page.tsx
 * Descripción: Punto de entrada de la página del Paso 1 de creación de perfil.
 * Implementa Suspense para manejar de forma segura el hook useSearchParams() del componente cliente.
 */

import { Suspense } from "react";
import CreateProfile1Client from "./CreateProfile1Client";

/**
 * Componente de servidor que envuelve al cliente en un límite de Suspense.
 * En Next.js (App Router), el uso de useSearchParams() requiere Suspense durante la
 * renderización estática para evitar errores en el tiempo de compilación.
 */
export default function Page() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 text-[#13ec80]">
          Cargando configuración de perfil...
        </div>
      }
    >
      <CreateProfile1Client />
    </Suspense>
  );
}