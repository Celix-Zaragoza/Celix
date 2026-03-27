"use client";

import { useEffect, useState, useCallback } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Search, EyeOff, Eye, Loader2, AlertCircle, Calendar, MapPin, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface Evento {
  id: string;
  title: string;
  tipo: string;
  startDate: string | null;
  ubicacion: string;
  organizer: string;
  oculto: boolean;
  gratuita: boolean;
}

interface Pagination {
  page: number;
  pages: number;
  total: number;
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

export default function Page() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [page, setPage] = useState(1);
  const [syncing, setSyncing] = useState(false);


  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${API}/api/v1/admin/events/sync`, {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success(`Sincronización completada: ${data.total} eventos actualizados`);
        fetchEventos();
      } else {
        toast.error("Error en la sincronización");
      }
    } catch {
      toast.error("Error al sincronizar");
    } finally {
      setSyncing(false);
    }
  };

  // ── Cargar eventos ────────────────────────────────────────────────────────
  const fetchEventos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (searchQuery) params.set("q", searchQuery);
      if (filterStatus === "visibles") params.set("estado", "visibles");
      else if (filterStatus === "ocultos") params.set("estado", "ocultos");

      const res = await fetch(`${API}/api/v1/admin/events?${params}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      if (data.ok) {
        setEventos(data.events);
        setPagination(data.pagination);
      }
    } catch (err) {
      setError("No se pudieron cargar los eventos.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, filterStatus]);

  useEffect(() => { fetchEventos(); }, [fetchEventos]);
  useEffect(() => { setPage(1); }, [searchQuery, filterStatus]);

  // ── Acciones ──────────────────────────────────────────────────────────────
  const handleHide = async (id: string) => {
    try {
      const res = await fetch(`${API}/api/v1/admin/events/${id}/hide`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error();
      setEventos((prev) => prev.map((e) => e.id === id ? { ...e, oculto: true } : e));
      toast.success("Evento ocultado");
    } catch {
      toast.error("Error al ocultar el evento");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const res = await fetch(`${API}/api/v1/admin/events/${id}/restore`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error();
      setEventos((prev) => prev.map((e) => e.id === id ? { ...e, oculto: false } : e));
      toast.success("Evento restaurado");
    } catch {
      toast.error("Error al restaurar el evento");
    }
  };

  const visibles = eventos.filter((e) => !e.oculto).length;
  const ocultos = eventos.filter((e) => e.oculto).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#f1f5f9] mb-2">Gestión de Eventos</h1>
          <p className="text-[#94a3b8]">Administra los eventos deportivos importados de Zaragoza</p>
        </div>
        <Button
          onClick={handleSync}
          disabled={syncing}
          className="bg-[#13ec80] text-[#102219] hover:bg-[#10d671] gap-2"
        >
          {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {syncing ? "Sincronizando..." : "Sincronizar"}
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-[#1e293b] rounded-xl shadow-sm border border-[rgba(148,163,184,0.2)] p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
            <Input
              type="text"
              placeholder="Buscar eventos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#0f172a] border-[rgba(148,163,184,0.2)] text-[#f1f5f9]"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-[#0f172a] border-[rgba(148,163,184,0.2)] text-[#f1f5f9]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="visibles">Visibles</SelectItem>
              <SelectItem value="ocultos">Ocultos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1e293b] rounded-lg border border-[rgba(148,163,184,0.2)] p-4">
          <p className="text-sm text-[#94a3b8] mb-1">Total</p>
          <p className="text-3xl font-bold text-[#f1f5f9]">{pagination.total}</p>
        </div>
        <div className="bg-[#1e293b] rounded-lg border border-[rgba(148,163,184,0.2)] p-4">
          <p className="text-sm text-[#94a3b8] mb-1">Visibles</p>
          <p className="text-3xl font-bold text-[#13ec80]">{visibles}</p>
        </div>
        <div className="bg-[#1e293b] rounded-lg border border-[rgba(148,163,184,0.2)] p-4">
          <p className="text-sm text-[#94a3b8] mb-1">Ocultos</p>
          <p className="text-3xl font-bold text-red-400">{ocultos}</p>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#13ec80] animate-spin" />
        </div>
      )}
      {!loading && error && (
        <div className="bg-[#1e293b] rounded-xl border border-red-500/30 p-8 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Tabla */}
      {!loading && !error && (
        <>
          <div className="bg-[#1e293b] rounded-xl border border-[rgba(148,163,184,0.2)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0f172a] border-b border-[rgba(148,163,184,0.2)]">
                  <tr>
                    {["Evento", "Tipo", "Fecha", "Ubicación", "Estado", "Acciones"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-[#94a3b8] uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(148,163,184,0.2)]">
                  {eventos.map((evento) => (
                    <tr key={evento.id} className="hover:bg-[#334155] transition-colors">
                      <td className="px-6 py-4 max-w-xs">
                        <p className="font-medium text-[#f1f5f9] text-sm truncate">{evento.title}</p>
                        {evento.organizer && (
                          <p className="text-xs text-[#94a3b8] truncate">{evento.organizer}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-[#13ec80] text-[#102219] text-xs font-semibold rounded-full">
                          {evento.tipo || "General"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#94a3b8]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#13ec80]" />
                          {evento.startDate
                            ? format(new Date(evento.startDate), "d MMM yyyy", { locale: es })
                            : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        {evento.ubicacion && (
                          <div className="flex items-center gap-1.5 text-sm text-[#94a3b8]">
                            <MapPin className="w-3.5 h-3.5 text-[#13ec80] flex-shrink-0" />
                            <span className="truncate">{evento.ubicacion}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          evento.oculto
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-[rgba(19,236,128,0.15)] text-[#13ec80] border border-[rgba(19,236,128,0.3)]"
                        }`}>
                          {evento.oculto ? "Oculto" : "Visible"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {evento.oculto ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRestore(evento.id)}
                            title="Hacer visible"
                            className="text-[#13ec80] hover:text-[#10d671]"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleHide(evento.id)}
                            title="Ocultar"
                            className="text-red-400 hover:text-red-300"
                          >
                            <EyeOff className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {eventos.length === 0 && (
                <div className="p-8 text-center text-[#94a3b8]">
                  No hay eventos que coincidan con los filtros.
                </div>
              )}
            </div>
          </div>

          {/* Paginación */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-[#94a3b8]">
                Página <span className="text-[#f1f5f9] font-medium">{pagination.page}</span> de{" "}
                <span className="text-[#f1f5f9] font-medium">{pagination.pages}</span>
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-[rgba(148,163,184,0.2)] text-[#94a3b8] disabled:opacity-40"
                >
                  ← Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="border-[rgba(148,163,184,0.2)] text-[#94a3b8] disabled:opacity-40"
                >
                  Siguiente →
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}