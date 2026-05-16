/**
 * Archivo: auth/layout.tsx
 * Descripción: Layout envolvente para el módulo de autenticación. 
 * Gestiona la redirección automática si el usuario ya está autenticado y 
 * proporciona un estilo base visual para todas las páginas de auth.
 */

"use client";

import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Layout componente que actúa como middleware visual y funcional para las rutas de login, 
 * registro y creación de perfil.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Efecto de guardia: Si el usuario ya cuenta con una sesión activa y 
   * está intentando acceder a rutas de /auth, se le redirige al feed principal.
   */
  useEffect(() => {
    if (isAuthenticated && pathname?.startsWith("/auth")) {
      router.replace("/app/feed");
    }
  }, [isAuthenticated, pathname, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {children}
    </div>
  );
}