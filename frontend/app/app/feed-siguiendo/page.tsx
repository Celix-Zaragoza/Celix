/**
 * Archivo: frontend/app/app/feed-siguiendo/page.tsx
 * Descripción: Página de feed que muestra publicaciones de las personas que sigues.
 */

"use client";

import { useRouter } from "next/navigation";
import { PublicationCard } from "../../components/PublicationCard";
import { mockPublicaciones } from "../../data/mockData";
import { Users } from "lucide-react";

/**
 * Componente de página de /app/feed-siguiendo que lista publicaciones de seguimiento.
 */
export default function Page() {
  const router = useRouter();

  const publicacionesSiguiendo = mockPublicaciones.slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#f1f5f9] mb-2">
          Siguiendo
        </h1>
        <p className="text-[#94a3b8]">
          Publicaciones de las personas que sigues
        </p>
      </div>

      {/* Publications */}
      <div className="space-y-4">
        {publicacionesSiguiendo.length > 0 ? (
          publicacionesSiguiendo.map((publicacion) => (
            <PublicationCard key={publicacion.id} publicacion={publicacion} />
          ))
        ) : (
          <div className="bg-[#1e293b] rounded-xl shadow-sm border border-[rgba(148,163,184,0.2)] p-12 text-center">
            <Users className="w-16 h-16 text-[#94a3b8] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#f1f5f9] mb-2">
              Aún no sigues a nadie
            </h3>
            <p className="text-[#94a3b8] mb-6">
              Empieza a seguir a otros deportistas para ver sus publicaciones aquí
            </p>
            <button
              onClick={() => router.push("/app/search")}
              className="px-6 py-3 bg-[#13ec80] text-[#102219] rounded-lg hover:bg-[#10d671] transition-colors"
            >
              Buscar usuarios
            </button>
          </div>
        )}
      </div>
    </div>
  );
}