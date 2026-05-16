/**
 * Archivo: /auth/page.tsx
 * Descripción: Página de redirección inicial
 *              Reenvía automáticamente al panel de login.
 */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth/login");
  }, [router]);

  return null;
}