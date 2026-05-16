/**
 * Archivo: /admin/page.tsx
 * Descripción: Página de redirección inicial del área de administración.
 *              Reenvía automáticamente al panel de publicaciones.
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Componente de página que redirige a /admin/publications.
 */
export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/publications");
  }, [router]);

  return null;
}