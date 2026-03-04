"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { PublicationCard } from "../../components/PublicationCard";
import { mockPublicaciones, deportesDisponibles } from "../../data/mockData";
import { Button } from "../../components/ui/button";
import { Sparkles, TrendingUp } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("para-ti");
  const [selectedDeporte, setSelectedDeporte] = useState<string | null>(null);

  const filteredPublicaciones = selectedDeporte
    ? mockPublicaciones.filter((p) => p.deporte === selectedDeporte)
    : mockPublicaciones;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#f1f5f9] mb-2">
          Feed de actividades
        </h1>
        <p className="text-[#94a3b8]">
          Descubre lo que está pasando en la comunidad deportiva de Zaragoza
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full grid grid-cols-2 h-12">
          <TabsTrigger value="para-ti" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Para ti
          </TabsTrigger>
          <TabsTrigger value="siguiendo" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Siguiendo
          </TabsTrigger>
        </TabsList>

        {/* Sport Filters */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedDeporte === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedDeporte(null)}
            className="flex-shrink-0"
          >
            Todos
          </Button>

          {deportesDisponibles.slice(0, 6).map((deporte) => (
            <Button
              key={deporte}
              variant={selectedDeporte === deporte ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDeporte(deporte)}
              className="flex-shrink-0"
            >
              {deporte}
            </Button>
          ))}
        </div>

        <TabsContent value="para-ti" className="space-y-4 mt-6">
          {filteredPublicaciones.length > 0 ? (
            filteredPublicaciones.map((publicacion) => (
              <PublicationCard key={publicacion.id} publicacion={publicacion} />
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500">
                No hay publicaciones de {selectedDeporte} disponibles
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="siguiendo" className="space-y-4 mt-6">
          {filteredPublicaciones.slice(0, 3).length > 0 ? (
            filteredPublicaciones.slice(0, 3).map((publicacion) => (
              <PublicationCard key={publicacion.id} publicacion={publicacion} />
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500 mb-4">
                Aún no sigues a nadie
              </p>
              <Button onClick={() => router.push("/app/search")}>
                Buscar usuarios
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Recommendations Card */}
      {activeTab === "para-ti" && (
        <div className="bg-[#1e293b] rounded-xl p-6 border border-[rgba(148,163,184,0.2)]">
          <div className="flex items-start gap-4">
            <div className="bg-[#13ec80] rounded-full p-3">
              <Sparkles className="w-6 h-6 text-[#102219]" />
            </div>
            <div>
              <h3 className="font-bold text-[#f1f5f9] mb-2">
                Recomendaciones personalizadas
              </h3>
              <p className="text-[#94a3b8] text-sm mb-3">
                Basadas en tus intereses en{" "}
                {deportesDisponibles.slice(0, 3).join(", ")} y tu zona
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-[#334155] rounded-full text-sm font-medium text-[#f1f5f9]">
                  📍 Centro
                </span>
                <span className="px-3 py-1 bg-[#334155] rounded-full text-sm font-medium text-[#f1f5f9]">
                  ⚽ Fútbol
                </span>
                <span className="px-3 py-1 bg-[#334155] rounded-full text-sm font-medium text-[#f1f5f9]">
                  🏃 Running
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}