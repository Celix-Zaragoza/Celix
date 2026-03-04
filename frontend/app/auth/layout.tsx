"use client";

import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // Si NO quieres redirigir desde auth cuando estás logueado, borra todo esto
  // y deja solo el return.
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // opcional: si ya estás logueado, fuera del auth
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