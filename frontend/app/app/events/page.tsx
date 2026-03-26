"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Calendar, MapPin, Search, ExternalLink, Loader2,
  AlertCircle, User, List, Map as MapIcon, Phone, Clock,
} from "lucide-react";
import { format, isAfter, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { MapComponent } from "../../components/MapComponent";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const EVENTOS_POR_PAGINA = 12;
const INSTALACIONES_POR_PAGINA = 12;

interface Evento {
  externalId: number;
  title: string;
  description: string;
  tipo: string;
  deporte: string;
  startDate: string | null;
  endDate: string | null;
  ubicacion: string;
  imagen: string | null;
  urlFuente: string;
  registrationUrl: string | null;
  organizer: string;
  gratuita: boolean;
}

interface InstalacionReal {
  id: string | number;
  nombre: string;
  direccion: string;
  telefono: string | null;
  horario: string | null;
  tipo: string;
  coordenadas: { lat: number; lng: number };
}

function formatFecha(dateStr: string | null): string {
  if (!dateStr) return "Fecha no disponible";
  try {
    return format(new Date(dateStr), "d 'de' MMMM 'de' yyyy", { locale: es });
  } catch {
    return "Fecha no disponible";
  }
}

function getTiposUnicos(eventos: Evento[]): string[] {
  const tipos = new Set(eventos.map((e) => e.tipo).filter(Boolean));
  return Array.from(tipos).sort();
}

export default function Page() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTipo, setSelectedTipo] = useState<string>("all");
  const [selectedFecha, setSelectedFecha] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("eventos");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [instalaciones, setInstalaciones] = useState<InstalacionReal[]>([]);
  const [loadingInstalaciones, setLoadingInstalaciones] = useState(false);
  const [currentPageInstalaciones, setCurrentPageInstalaciones] = useState(1);

  useEffect(() => {
    const fetchEventos = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API}/api/v1/events`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        if (data.ok) setEventos(data.events ?? []);
        else throw new Error("Respuesta inesperada del servidor");
      } catch (err: any) {
        setError("No se pudieron cargar los eventos. Inténtalo de nuevo.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEventos();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTipo, selectedFecha]);

  useEffect(() => {
    setCurrentPageInstalaciones(1);
  }, [searchQuery]);

  useEffect(() => {
    if (activeTab !== "instalaciones") return;
    if (instalaciones.length > 0) return;

    const fetchInstalaciones = async () => {
      setLoadingInstalaciones(true);
      try {
        const res = await fetch(`${API}/api/v1/instalaciones`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        if (data.ok) setInstalaciones(data.instalaciones ?? []);
      } catch (err) {
        console.error("Error cargando instalaciones:", err);
      } finally {
        setLoadingInstalaciones(false);
      }
    };

    fetchInstalaciones();
  }, [activeTab]);

  const tiposUnicos = useMemo(() => getTiposUnicos(eventos), [eventos]);

  const filteredEventos = useMemo(() => {
    const hoy = startOfDay(new Date());
    return eventos.filter((evento) => {
      const matchesSearch =
        !searchQuery ||
        evento.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evento.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evento.ubicacion?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTipo = selectedTipo === "all" || evento.tipo === selectedTipo;
      let matchesFecha = true;
      if (selectedFecha === "proximos" && evento.startDate) {
        matchesFecha = isAfter(new Date(evento.startDate), hoy);
      } else if (selectedFecha === "pasados" && evento.startDate) {
        matchesFecha = isBefore(new Date(evento.startDate), hoy);
      } else if (selectedFecha === "hoy" && evento.startDate) {
        const eventoDay = startOfDay(new Date(evento.startDate));
        matchesFecha = eventoDay.getTime() === hoy.getTime();
      }
      return matchesSearch && matchesTipo && matchesFecha;
    });
  }, [eventos, searchQuery, selectedTipo, selectedFecha]);

  const totalPages = Math.ceil(filteredEventos.length / EVENTOS_POR_PAGINA);
  const eventosPaginados = filteredEventos.slice(
    (currentPage - 1) * EVENTOS_POR_PAGINA,
    currentPage * EVENTOS_POR_PAGINA
  );

  const filteredInstalaciones = instalaciones.filter((i) =>
    i.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPagesInstalaciones = Math.ceil(filteredInstalaciones.length / INSTALACIONES_POR_PAGINA);
  const instalacionesPaginadas = filteredInstalaciones.slice(
    (currentPageInstalaciones - 1) * INSTALACIONES_POR_PAGINA,
    currentPageInstalaciones * INSTALACIONES_POR_PAGINA
  );

  const PaginacionEventos = () => (
    <div className="mt-8">
      <div className="flex items-center justify-between gap-2 md:hidden">
        <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="border-[rgba(148,163,184,0.2)] text-[#94a3b8] hover:text-[#f1f5f9] disabled:opacity-40">← Anterior</Button>
        <span className="text-sm text-[#94a3b8]"><span className="text-[#13ec80] font-bold">{currentPage}</span> / {totalPages}</span>
        <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="border-[rgba(148,163,184,0.2)] text-[#94a3b8] hover:text-[#f1f5f9] disabled:opacity-40">Siguiente →</Button>
      </div>
      <div className="hidden md:flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="border-[rgba(148,163,184,0.2)] text-[#94a3b8] hover:text-[#f1f5f9] disabled:opacity-40">← Anterior</Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .reduce<(number | "...")[]>((acc, p, idx, arr) => {
              if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
              acc.push(p);
              return acc;
            }, [])
            .map((item, idx) =>
              item === "..." ? (
                <span key={`dots-ev-${idx}`} className="px-2 text-[#94a3b8]">…</span>
              ) : (
                <button key={item} onClick={() => setCurrentPage(item as number)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${currentPage === item ? "bg-[#13ec80] text-[#102219]" : "text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[rgba(148,163,184,0.1)]"}`}>{item}</button>
              )
            )}
        </div>
        <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="border-[rgba(148,163,184,0.2)] text-[#94a3b8] hover:text-[#f1f5f9] disabled:opacity-40">Siguiente →</Button>
      </div>
    </div>
  );

  const PaginacionInstalaciones = () => (
    <div className="mt-8">
      <div className="flex items-center justify-between gap-2 md:hidden">
        <Button variant="outline" size="sm" onClick={() => setCurrentPageInstalaciones((p) => Math.max(1, p - 1))} disabled={currentPageInstalaciones === 1} className="border-[rgba(148,163,184,0.2)] text-[#94a3b8] hover:text-[#f1f5f9] disabled:opacity-40">← Anterior</Button>
        <span className="text-sm text-[#94a3b8]"><span className="text-[#13ec80] font-bold">{currentPageInstalaciones}</span> / {totalPagesInstalaciones}</span>
        <Button variant="outline" size="sm" onClick={() => setCurrentPageInstalaciones((p) => Math.min(totalPagesInstalaciones, p + 1))} disabled={currentPageInstalaciones === totalPagesInstalaciones} className="border-[rgba(148,163,184,0.2)] text-[#94a3b8] hover:text-[#f1f5f9] disabled:opacity-40">Siguiente →</Button>
      </div>
      <div className="hidden md:flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setCurrentPageInstalaciones((p) => Math.max(1, p - 1))} disabled={currentPageInstalaciones === 1} className="border-[rgba(148,163,184,0.2)] text-[#94a3b8] hover:text-[#f1f5f9] disabled:opacity-40">← Anterior</Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPagesInstalaciones }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPagesInstalaciones || Math.abs(p - currentPageInstalaciones) <= 1)
            .reduce<(number | "...")[]>((acc, p, idx, arr) => {
              if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
              acc.push(p);
              return acc;
            }, [])
            .map((item, idx) =>
              item === "..." ? (
                <span key={`dots-inst-${idx}`} className="px-2 text-[#94a3b8]">…</span>
              ) : (
                <button key={item} onClick={() => setCurrentPageInstalaciones(item as number)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${currentPageInstalaciones === item ? "bg-[#13ec80] text-[#102219]" : "text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[rgba(148,163,184,0.1)]"}`}>{item}</button>
              )
            )}
        </div>
        <Button variant="outline" size="sm" onClick={() => setCurrentPageInstalaciones((p) => Math.min(totalPagesInstalaciones, p + 1))} disabled={currentPageInstalaciones === totalPagesInstalaciones} className="border-[rgba(148,163,184,0.2)] text-[#94a3b8] hover:text-[#f1f5f9] disabled:opacity-40">Siguiente →</Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#f1f5f9] mb-2">Eventos e Instalaciones</h1>
        <p className="text-[#94a3b8]">Descubre eventos deportivos y encuentra las mejores instalaciones de Zaragoza</p>
      </div>

      {/* Filtros */}
      <div className="bg-[#1e293b] rounded-xl shadow-sm border border-[rgba(148,163,184,0.2)] p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
            <Input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#0f172a] border-[rgba(148,163,184,0.2)] text-[#f1f5f9] placeholder:text-[#94a3b8]"
            />
          </div>
          <Select value={selectedTipo} onValueChange={setSelectedTipo}>
            <SelectTrigger className="bg-[#0f172a] border-[rgba(148,163,184,0.2)] text-[#f1f5f9]">
              <SelectValue placeholder="Tipo de actividad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {tiposUnicos.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedFecha} onValueChange={setSelectedFecha}>
            <SelectTrigger className="bg-[#0f172a] border-[rgba(148,163,184,0.2)] text-[#f1f5f9]">
              <SelectValue placeholder="Fecha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las fechas</SelectItem>
              <SelectItem value="hoy">Hoy</SelectItem>
              <SelectItem value="proximos">Próximos</SelectItem>
              <SelectItem value="pasados">Pasados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2 h-12 mb-6">
          <TabsTrigger value="eventos">Eventos {!loading && `(${filteredEventos.length})`}</TabsTrigger>
          <TabsTrigger value="instalaciones">Instalaciones ({filteredInstalaciones.length})</TabsTrigger>
        </TabsList>

        {/* ── Tab Eventos ── */}
        <TabsContent value="eventos">
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-10 h-10 text-[#13ec80] animate-spin" />
              <p className="text-[#94a3b8]">Cargando eventos de Zaragoza...</p>
            </div>
          )}
          {!loading && error && (
            <div className="bg-[#1e293b] rounded-xl border border-red-500/30 p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-400 font-medium mb-1">{error}</p>
              <p className="text-[#94a3b8] text-sm">Comprueba tu conexión o inténtalo más tarde</p>
            </div>
          )}
          {!loading && !error && filteredEventos.length === 0 && (
            <div className="bg-[#1e293b] rounded-xl border border-[rgba(148,163,184,0.2)] p-12 text-center">
              <Calendar className="w-16 h-16 text-[#94a3b8] mx-auto mb-4" />
              <p className="text-[#f1f5f9] font-medium mb-1">No se encontraron eventos</p>
              <p className="text-[#94a3b8] text-sm">Prueba a cambiar los filtros de búsqueda</p>
            </div>
          )}
          {!loading && !error && filteredEventos.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {eventosPaginados.map((evento) => (
                  <div
                    key={evento.externalId}
                    className="bg-[#1e293b] rounded-xl border border-[rgba(148,163,184,0.2)] overflow-hidden hover:border-[rgba(19,236,128,0.3)] transition-colors"
                  >
                    {evento.imagen ? (
                      console.log("Mostrando imagen para evento:", evento.title, "URL:", evento.imagen),
                      <div className="w-full h-44 bg-[#0f172a]">
                        <img
                          src={evento.imagen}
                          alt={evento.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = `https://placehold.co/600x400/1e293b/13ec80?text=${encodeURIComponent(evento.tipo || "Evento")}`;
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-24 flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(19,236,128,0.08), rgba(19,236,128,0.02))" }}>
                        <Calendar className="w-10 h-10 text-[#13ec80] opacity-40" />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {evento.tipo && evento.tipo !== "General" && (
                          <span className="px-2 py-0.5 bg-[#13ec80] text-[#102219] text-xs font-semibold rounded-full">{evento.tipo}</span>
                        )}
                        {evento.gratuita && (
                          <span className="px-2 py-0.5 bg-[rgba(19,236,128,0.15)] text-[#13ec80] text-xs font-semibold rounded-full border border-[rgba(19,236,128,0.3)]">Gratuito</span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-[#f1f5f9] mb-2 line-clamp-2">{evento.title}</h3>
                      {evento.description && (
                        <p className="text-[#94a3b8] text-sm mb-4 line-clamp-2">{evento.description}</p>
                      )}
                      <div className="space-y-1.5 text-sm text-[#94a3b8] mb-4">
                        {evento.startDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 flex-shrink-0 text-[#13ec80]" />
                            <span>{formatFecha(evento.startDate)}</span>
                          </div>
                        )}
                        {evento.ubicacion && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 flex-shrink-0 text-[#13ec80]" />
                            <span className="line-clamp-1">{evento.ubicacion}</span>
                          </div>
                        )}
                        {evento.organizer && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 flex-shrink-0 text-[#13ec80]" />
                            <span className="line-clamp-1">{evento.organizer}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {evento.registrationUrl && (
                          <a href={evento.registrationUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                            <Button className="w-full bg-[#13ec80] text-[#102219] hover:bg-[#10d671] font-semibold gap-2">
                              <ExternalLink className="w-4 h-4" />Inscribirse
                            </Button>
                          </a>
                        )}
                        {evento.urlFuente && (
                          <a href={evento.urlFuente} target="_blank" rel="noopener noreferrer" className={evento.registrationUrl ? "" : "flex-1"}>
                            <Button variant="outline" className={`gap-2 border-[rgba(148,163,184,0.3)] text-[#94a3b8] hover:text-[#f1f5f9] ${!evento.registrationUrl ? "w-full" : ""}`}>
                              <ExternalLink className="w-4 h-4" />{evento.registrationUrl ? "Más info" : "Ver evento"}
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && <PaginacionEventos />}
            </>
          )}
        </TabsContent>

        {/* ── Tab Instalaciones ── */}
        <TabsContent value="instalaciones" className="space-y-4">
          <div className="flex justify-end gap-2 mb-4">
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")} className="gap-2">
              <List className="w-4 h-4" />Lista
            </Button>
            <Button variant={viewMode === "map" ? "default" : "outline"} size="sm" onClick={() => setViewMode("map")} className="gap-2">
              <MapIcon className="w-4 h-4" />Mapa
            </Button>
          </div>

          {viewMode === "map" ? (
            <div className="bg-[#1e293b] rounded-xl shadow-sm border border-[rgba(148,163,184,0.2)] overflow-hidden">
              <MapComponent />
            </div>
          ) : loadingInstalaciones ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-10 h-10 text-[#13ec80] animate-spin" />
              <p className="text-[#94a3b8]">Cargando instalaciones...</p>
            </div>
          ) : filteredInstalaciones.length === 0 ? (
            <div className="bg-[#1e293b] rounded-xl border border-[rgba(148,163,184,0.2)] p-12 text-center">
              <MapPin className="w-16 h-16 text-[#94a3b8] mx-auto mb-4" />
              <p className="text-[#f1f5f9] font-medium mb-1">No se encontraron instalaciones</p>
              <p className="text-[#94a3b8] text-sm">Prueba a cambiar el texto de búsqueda</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {instalacionesPaginadas.map((instalacion) => (
                  <div
                    key={instalacion.id}
                    className="bg-[#1e293b] rounded-xl border border-[rgba(148,163,184,0.2)] p-5 hover:border-[rgba(19,236,128,0.3)] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-[#f1f5f9] flex-1">{instalacion.nombre}</h3>
                      <span className="px-2 py-0.5 bg-[#13ec80] text-[#102219] text-xs font-semibold rounded-full ml-2 flex-shrink-0">
                        {instalacion.tipo}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-sm text-[#94a3b8]">
                      {instalacion.direccion && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#13ec80]" />
                          <span>{instalacion.direccion}</span>
                        </div>
                      )}
                      {instalacion.horario && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#13ec80]" />
                          <span>{instalacion.horario}</span>
                        </div>
                      )}
                      {instalacion.telefono && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-[#13ec80]" />
                          <span>{instalacion.telefono}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {totalPagesInstalaciones > 1 && <PaginacionInstalaciones />}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}