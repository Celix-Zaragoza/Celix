"use client";

import { useState } from "react";
import { mockEventos, mockInstalaciones, deportesDisponibles } from "../../data/mockData";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Calendar, MapPin, Users, Phone, Clock, Search, List, Map as MapIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { MapComponent } from "../../components/MapComponent";

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeporte, setSelectedDeporte] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("eventos");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const filteredEventos = mockEventos.filter((evento) => {
    const matchesSearch =
      evento.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evento.descripcion.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDeporte = selectedDeporte === "all" || evento.deporte === selectedDeporte;
    return matchesSearch && matchesDeporte;
  });

  const filteredInstalaciones = mockInstalaciones.filter((instalacion) => {
    const matchesSearch = instalacion.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDeporte = selectedDeporte === "all" || instalacion.deportes.includes(selectedDeporte);
    return matchesSearch && matchesDeporte;
  });

  const handleInscribirse = (eventoNombre: string) => {
    toast.success(`Te has inscrito a ${eventoNombre}`);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#f1f5f9] mb-2">Eventos e Instalaciones</h1>
        <p className="text-[#94a3b8]">
          Descubre eventos deportivos y encuentra las mejores instalaciones de Zaragoza
        </p>
      </div>

      {/* Filters */}
      <div className="bg-[#1e293b] rounded-xl shadow-sm border border-[rgba(148,163,184,0.2)] p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
            <Input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedDeporte} onValueChange={setSelectedDeporte}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los deportes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los deportes</SelectItem>
              {deportesDisponibles.map((deporte) => (
                <SelectItem key={deporte} value={deporte}>
                  {deporte}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2 h-12 mb-6">
          <TabsTrigger value="eventos">Eventos ({filteredEventos.length})</TabsTrigger>
          <TabsTrigger value="instalaciones">Instalaciones ({filteredInstalaciones.length})</TabsTrigger>
        </TabsList>

        {/* Eventos Tab */}
        <TabsContent value="eventos" className="space-y-4">
          {filteredEventos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEventos.map((evento) => (
                <div
                  key={evento.id}
                  className="bg-[#1e293b] rounded-xl shadow-sm border border-[rgba(148,163,184,0.2)] overflow-hidden hover:shadow-md transition-shadow"
                >
                  {evento.imagen && (
                    <div className="w-full h-48 bg-[#334155]">
                      <img src={evento.imagen} alt={evento.nombre} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-[#f1f5f9] flex-1">{evento.nombre}</h3>
                      <span className="px-3 py-1 bg-[#13ec80] text-[#102219] text-xs font-medium rounded-full flex-shrink-0 ml-2">
                        {evento.deporte}
                      </span>
                    </div>
                    <p className="text-[#94a3b8] text-sm mb-4">{evento.descripcion}</p>
                    <div className="space-y-2 text-sm text-[#94a3b8] mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(new Date(evento.fecha), "d 'de' MMMM 'de' yyyy", { locale: es })} a las {evento.hora}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{evento.ubicacion}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>
                          {evento.participantes}/{evento.maxParticipantes} participantes
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleInscribirse(evento.nombre)}
                      className="w-full bg-[#13ec80] text-[#102219] hover:bg-[#10d671]"
                    >
                      Inscribirse
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#1e293b] rounded-xl shadow-sm border border-[rgba(148,163,184,0.2)] p-12 text-center">
              <Calendar className="w-16 h-16 text-[#94a3b8] mx-auto mb-4" />
              <p className="text-[#94a3b8]">No se encontraron eventos</p>
            </div>
          )}
        </TabsContent>

        {/* Instalaciones Tab */}
        <TabsContent value="instalaciones" className="space-y-4">
          {/* View Toggle */}
          <div className="flex justify-end gap-2 mb-4">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="gap-2"
            >
              <List className="w-4 h-4" />
              Lista
            </Button>
            <Button
              variant={viewMode === "map" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("map")}
              className="gap-2"
            >
              <MapIcon className="w-4 h-4" />
              Mapa
            </Button>
          </div>

          {filteredInstalaciones.length > 0 ? (
            <>
              {viewMode === "map" ? (
                <div className="bg-[#1e293b] rounded-xl shadow-sm border border-[rgba(148,163,184,0.2)] overflow-hidden">
                  <MapComponent instalaciones={filteredInstalaciones} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredInstalaciones.map((instalacion) => (
                    <div
                      key={instalacion.id}
                      className="bg-[#1e293b] rounded-xl shadow-sm border border-[rgba(148,163,184,0.2)] p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-[#f1f5f9] flex-1">{instalacion.nombre}</h3>
                        <span className="px-3 py-1 bg-[#13ec80] text-[#102219] text-xs font-medium rounded-full flex-shrink-0 ml-2">
                          {instalacion.tipo}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-[#94a3b8] mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{instalacion.direccion}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{instalacion.horario}</span>
                        </div>
                        {instalacion.telefono && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{instalacion.telefono}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {instalacion.deportes.map((deporte) => (
                          <span
                            key={deporte}
                            className="px-2 py-1 bg-[#13ec80] text-[#102219] text-xs font-medium rounded-full"
                          >
                            {deporte}
                          </span>
                        ))}
                      </div>
                      <Button variant="outline" className="w-full" onClick={() => setViewMode("map")}>
                        Ver en mapa
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="bg-[#1e293b] rounded-xl shadow-sm border border-[rgba(148,163,184,0.2)] p-12 text-center">
              <MapPin className="w-16 h-16 text-[#94a3b8] mx-auto mb-4" />
              <p className="text-[#94a3b8]">No se encontraron instalaciones</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}