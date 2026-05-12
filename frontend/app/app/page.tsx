/**
 * Archivo: /app/page.tsx
 * Descripción: Página de redirección inicial
 *              Reenvía automáticamente al panel de publicaciones.
 */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/app/feed");
  }, [router]);

  return null;
}