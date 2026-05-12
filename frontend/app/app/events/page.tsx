/**
 * Archivo: frontend/app/app/events/page.tsx
 * Descripción: Página principal de eventos e instalaciones en la aplicación Celix.
 *              Incluye búsqueda, filtros, vista de mapa y paginación.
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import {
  Calendar, MapPin, Search, ExternalLink, Loader2,
  AlertCircle, User, List, Map as MapIcon, Phone, Clock,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MapComponent } from "../../components/MapComponent";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const INSTALACIONES_POR_PAGINA = 12;

interface Evento {
  id: string;
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

interface Pagination {
  page: number;
  pages: number;
  total: number;
}

/**
 * Formatea una fecha al formato largo en español.
 * @param dateStr Fecha en formato ISO o nula
 */
function formatFecha(dateStr: string | null): string {
  if (!dateStr) return "Fecha no disponible";
  try {
    return format(new Date(dateStr), "d 'de' MMMM 'de' yyyy", { locale: es });
  } catch {
    return "Fecha no disponible";
  }
}

/**
 * Genera estilos dinámicos para botones de paginación.
 */
const btnPage = (active: boolean) => ({
  backgroundColor: active ? "#13ec80" : "transparent",
  color: active ? "#102219" : "#94a3b8",
} as React.CSSProperties);

/**
 * Componente de página de /app/events que muestra eventos e instalaciones.
 */
export default function Page() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTipo, setSelectedTipo] = useState<string>("all");
  const [selectedFecha, setSelectedFecha] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("eventos");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [instalaciones, setInstalaciones] = useState<InstalacionReal[]>([]);
  const [loadingInstalaciones, setLoadingInstalaciones] = useState(false);
  const [currentPageInstalaciones, setCurrentPageInstalaciones] = useState(1);

  /**
   * Recupera los eventos desde el backend con los filtros y la página actual.
   */
  const fetchEventos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(currentPage), limit: "12" });
      if (searchQuery) params.set("query", searchQuery);
      if (selectedTipo !== "all") params.set("tipo", selectedTipo);
      if (selectedFecha !== "all") params.set("fecha", selectedFecha);

      const res = await fetch(`${API}/api/v1/events?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      if (data.ok) { setEventos(data.events ?? []); setPagination(data.pagination); }
      else throw new Error("Respuesta inesperada del servidor");
    } catch (err: any) {
      setError("No se pudieron cargar los eventos. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedTipo, selectedFecha]);

  useEffect(() => { fetchEventos(); }, [fetchEventos]);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedTipo, selectedFecha]);
  useEffect(() => { setCurrentPageInstalaciones(1); }, [searchQuery]);

  useEffect(() => {
    if (activeTab !== "instalaciones" || instalaciones.length > 0) return;

    /**
     * Recupera las instalaciones deportivas desde el backend la primera vez que se muestra la pestaña.
     */
    const fetchInstalaciones = async () => {
      setLoadingInstalaciones(true);
      try {
        const res = await fetch(`${API}/api/v1/instalaciones`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data.ok) setInstalaciones(data.instalaciones ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingInstalaciones(false);
      }
    };
    fetchInstalaciones();
  }, [activeTab]);

  const filteredInstalaciones = instalaciones.filter((i) =>
    i.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPagesInstalaciones = Math.ceil(filteredInstalaciones.length / INSTALACIONES_POR_PAGINA);
  const instalacionesPaginadas = filteredInstalaciones.slice(
    (currentPageInstalaciones - 1) * INSTALACIONES_POR_PAGINA,
    currentPageInstalaciones * INSTALACIONES_POR_PAGINA
  );

  const inputStyle: React.CSSProperties = {
    backgroundColor: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#f1f5f9",
  };

  const selectWrap: React.CSSProperties = {
    backgroundColor: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    overflow: "hidden",
  };

  const PaginacionEventos = () => (
    <div className="mt-8">
      <div className="flex items-center justify-between gap-2 md:hidden">
        <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 h-9 rounded-lg text-sm font-medium disabled:opacity-40" style={{ ...inputStyle }}>← Anterior</button>
        <span className="text-sm" style={{ color: "#94a3b8" }}><span style={{ color: "#13ec80", fontWeight: 700 }}>{currentPage}</span> / {pagination.pages}</span>
        <button onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))} disabled={currentPage === pagination.pages} className="px-4 h-9 rounded-lg text-sm font-medium disabled:opacity-40" style={{ ...inputStyle }}>Siguiente →</button>
      </div>
      <div className="hidden md:flex items-center justify-center gap-2">
        <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 h-9 rounded-lg text-sm font-medium disabled:opacity-40" style={{ ...inputStyle }}>← Anterior</button>
        <div className="flex items-center gap-1">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === pagination.pages || Math.abs(p - currentPage) <= 1)
            .reduce<(number | "...")[]>((acc, p, idx, arr) => {
              if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
              acc.push(p); return acc;
            }, [])
            .map((item, idx) =>
              item === "..." ? <span key={`dots-ev-${idx}`} className="px-2" style={{ color: "#94a3b8" }}>…</span> :
              <button key={item} onClick={() => setCurrentPage(item as number)} className="w-9 h-9 rounded-lg text-sm font-medium transition-colors" style={btnPage(currentPage === item)}>{item}</button>
            )}
        </div>
        <button onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))} disabled={currentPage === pagination.pages} className="px-4 h-9 rounded-lg text-sm font-medium disabled:opacity-40" style={{ ...inputStyle }}>Siguiente →</button>
      </div>
    </div>
  );

  const PaginacionInstalaciones = () => (
    <div className="mt-8">
      <div className="flex items-center justify-between gap-2 md:hidden">
        <button onClick={() => setCurrentPageInstalaciones((p) => Math.max(1, p - 1))} disabled={currentPageInstalaciones === 1} className="px-4 h-9 rounded-lg text-sm font-medium disabled:opacity-40" style={{ ...inputStyle }}>← Anterior</button>
        <span className="text-sm" style={{ color: "#94a3b8" }}><span style={{ color: "#13ec80", fontWeight: 700 }}>{currentPageInstalaciones}</span> / {totalPagesInstalaciones}</span>
        <button onClick={() => setCurrentPageInstalaciones((p) => Math.min(totalPagesInstalaciones, p + 1))} disabled={currentPageInstalaciones === totalPagesInstalaciones} className="px-4 h-9 rounded-lg text-sm font-medium disabled:opacity-40" style={{ ...inputStyle }}>Siguiente →</button>
      </div>
      <div className="hidden md:flex items-center justify-center gap-2">
        <button onClick={() => setCurrentPageInstalaciones((p) => Math.max(1, p - 1))} disabled={currentPageInstalaciones === 1} className="px-4 h-9 rounded-lg text-sm font-medium disabled:opacity-40" style={{ ...inputStyle }}>← Anterior</button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPagesInstalaciones }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPagesInstalaciones || Math.abs(p - currentPageInstalaciones) <= 1)
            .reduce<(number | "...")[]>((acc, p, idx, arr) => {
              if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
              acc.push(p); return acc;
            }, [])
            .map((item, idx) =>
              item === "..." ? <span key={`dots-inst-${idx}`} className="px-2" style={{ color: "#94a3b8" }}>…</span> :
              <button key={item} onClick={() => setCurrentPageInstalaciones(item as number)} className="w-9 h-9 rounded-lg text-sm font-medium transition-colors" style={btnPage(currentPageInstalaciones === item)}>{item}</button>
            )}
        </div>
        <button onClick={() => setCurrentPageInstalaciones((p) => Math.min(totalPagesInstalaciones, p + 1))} disabled={currentPageInstalaciones === totalPagesInstalaciones} className="px-4 h-9 rounded-lg text-sm font-medium disabled:opacity-40" style={{ ...inputStyle }}>Siguiente →</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black mb-1" style={{ color: "#f1f5f9" }}>Eventos e Instalaciones</h1>
        <p className="text-sm" style={{ color: "#94a3b8" }}>Descubre eventos deportivos y encuentra las mejores instalaciones de Zaragoza</p>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#13ec80" }} />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#13ec80")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>
          <div style={selectWrap}>
            <Select value={selectedTipo} onValueChange={setSelectedTipo}>
              <SelectTrigger className="h-11 border-0 bg-transparent text-sm focus:ring-0" style={{ color: "#f1f5f9" }}>
                <SelectValue placeholder="Tipo de actividad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {["Deporte", "Atletismo", "Fútbol", "Baloncesto", "Natación", "Tenis", "Pádel", "Ciclismo", "Running", "Yoga"].map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div style={selectWrap}>
            <Select value={selectedFecha} onValueChange={setSelectedFecha}>
              <SelectTrigger className="h-11 border-0 bg-transparent text-sm focus:ring-0" style={{ color: "#f1f5f9" }}>
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
      </div>

      {/* Tabs */}
      <div className="flex items-center mb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        {[
          { key: "eventos", label: `Eventos${!loading ? ` (${pagination.total})` : ""}` },
          { key: "instalaciones", label: `Instalaciones (${filteredInstalaciones.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 py-3 text-sm font-semibold transition-colors relative"
            style={{ color: activeTab === tab.key ? "#f1f5f9" : "#94a3b8" }}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full" style={{ width: "40%", backgroundColor: "#13ec80" }} />
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Eventos ── */}
      {activeTab === "eventos" && (
        <>
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-10 h-10 animate-spin" style={{ color: "#13ec80" }} />
              <p className="text-sm" style={{ color: "#94a3b8" }}>Cargando eventos de Zaragoza...</p>
            </div>
          )}
          {!loading && error && (
            <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <p className="text-red-400 font-medium mb-1">{error}</p>
              <p className="text-sm" style={{ color: "#94a3b8" }}>Comprueba tu conexión o inténtalo más tarde</p>
            </div>
          )}
          {!loading && !error && eventos.length === 0 && (
            <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <Calendar className="w-14 h-14 mx-auto mb-4" style={{ color: "rgba(148,163,184,0.3)" }} />
              <p className="font-semibold mb-1" style={{ color: "#f1f5f9" }}>No se encontraron eventos</p>
              <p className="text-sm" style={{ color: "#94a3b8" }}>Prueba a cambiar los filtros de búsqueda</p>
            </div>
          )}
          {!loading && !error && eventos.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {eventos.map((evento) => (
                  <div
                    key={evento.id ?? evento.externalId}
                    className="rounded-2xl overflow-hidden transition-all"
                    style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(19,236,128,0.3)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
                  >
                    {evento.imagen ? (
                      <div className="w-full h-44">
                        <img
                          src={evento.imagen}
                          alt={evento.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const t = e.target as HTMLImageElement;
                            t.onerror = null;
                            t.src = `https://placehold.co/600x400/0f2318/13ec80?text=${encodeURIComponent(evento.tipo || "Evento")}`;
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-20 flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(19,236,128,0.08), rgba(19,236,128,0.02))" }}>
                        <Calendar className="w-8 h-8 opacity-30" style={{ color: "#13ec80" }} />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {evento.tipo && evento.tipo !== "General" && (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full" style={{ backgroundColor: "#13ec80", color: "#102219" }}>{evento.tipo}</span>
                        )}
                        {evento.gratuita && (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full" style={{ backgroundColor: "rgba(19,236,128,0.12)", color: "#13ec80", border: "1px solid rgba(19,236,128,0.3)" }}>Gratuito</span>
                        )}
                      </div>
                      <h3 className="text-base font-bold mb-2 line-clamp-2" style={{ color: "#f1f5f9" }}>{evento.title}</h3>
                      {evento.description && (
                        <p className="text-sm mb-4 line-clamp-2" style={{ color: "#94a3b8" }}>{evento.description}</p>
                      )}
                      <div className="space-y-1.5 text-sm mb-4" style={{ color: "#94a3b8" }}>
                        {evento.startDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#13ec80" }} />
                            <span>{formatFecha(evento.startDate)}</span>
                          </div>
                        )}
                        {evento.ubicacion && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#13ec80" }} />
                            <span className="line-clamp-1">{evento.ubicacion}</span>
                          </div>
                        )}
                        {evento.organizer && (
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#13ec80" }} />
                            <span className="line-clamp-1">{evento.organizer}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {evento.registrationUrl && (
                          <a href={evento.registrationUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                            <button className="w-full h-9 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all" style={{ backgroundColor: "#13ec80", color: "#102219" }}>
                              <ExternalLink className="w-3.5 h-3.5" />Inscribirse
                            </button>
                          </a>
                        )}
                        {evento.urlFuente && (
                          <a href={evento.urlFuente} target="_blank" rel="noopener noreferrer" className={evento.registrationUrl ? "" : "flex-1"}>
                            <button className={`h-9 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all px-4 ${!evento.registrationUrl ? "w-full" : ""}`} style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)" }}>
                              <ExternalLink className="w-3.5 h-3.5" />{evento.registrationUrl ? "Más info" : "Ver evento"}
                            </button>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {pagination.pages > 1 && <PaginacionEventos />}
            </>
          )}
        </>
      )}

      {/* ── Tab Instalaciones ── */}
      {activeTab === "instalaciones" && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2 mb-4">
            {[
              { mode: "list", icon: <List className="w-4 h-4" />, label: "Lista" },
              { mode: "map", icon: <MapIcon className="w-4 h-4" />, label: "Mapa" },
            ].map((btn) => (
              <button
                key={btn.mode}
                onClick={() => setViewMode(btn.mode as "list" | "map")}
                className="flex items-center gap-2 px-3 h-9 rounded-xl text-sm font-semibold transition-all"
                style={{
                  backgroundColor: viewMode === btn.mode ? "#13ec80" : "rgba(255,255,255,0.06)",
                  color: viewMode === btn.mode ? "#102219" : "#94a3b8",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {btn.icon}{btn.label}
              </button>
            ))}
          </div>

          {viewMode === "map" ? (
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <MapComponent />
            </div>
          ) : loadingInstalaciones ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-10 h-10 animate-spin" style={{ color: "#13ec80" }} />
              <p className="text-sm" style={{ color: "#94a3b8" }}>Cargando instalaciones...</p>
            </div>
          ) : filteredInstalaciones.length === 0 ? (
            <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <MapPin className="w-14 h-14 mx-auto mb-4" style={{ color: "rgba(148,163,184,0.3)" }} />
              <p className="font-semibold mb-1" style={{ color: "#f1f5f9" }}>No se encontraron instalaciones</p>
              <p className="text-sm" style={{ color: "#94a3b8" }}>Prueba a cambiar el texto de búsqueda</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {instalacionesPaginadas.map((instalacion) => (
                  <div
                    key={instalacion.id}
                    className="rounded-2xl p-5 transition-all"
                    style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(19,236,128,0.3)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-sm font-bold flex-1" style={{ color: "#f1f5f9" }}>{instalacion.nombre}</h3>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full ml-2 flex-shrink-0" style={{ backgroundColor: "#13ec80", color: "#102219" }}>
                        {instalacion.tipo}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-sm" style={{ color: "#94a3b8" }}>
                      {instalacion.direccion && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5" style={{ color: "#13ec80" }} />
                          <span>{instalacion.direccion}</span>
                        </div>
                      )}
                      {instalacion.horario && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" style={{ color: "#13ec80" }} />
                          <span>{instalacion.horario}</span>
                        </div>
                      )}
                      {instalacion.telefono && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5" style={{ color: "#13ec80" }} />
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
        </div>
      )}
    </div>
  );
}