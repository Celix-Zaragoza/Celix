"use client";

import { useEffect, useState, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Search, EyeOff, Eye, Loader2, AlertCircle, Calendar, MapPin, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ConfirmModal } from "../../components/ConfirmModal";

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

export default function Page() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [page, setPage] = useState(1);
  const [syncing, setSyncing] = useState(false);
  const [stats, setStats] = useState({ visibles: 0, ocultos: 0 });
  const [modal, setModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    danger: boolean;
    onConfirm: () => void;
  } | null>(null);

  const closeModal = () => setModal(null);

  const fetchEventos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (searchQuery) params.set("q", searchQuery);
      if (filterStatus === "visibles") params.set("estado", "visibles");
      else if (filterStatus === "ocultos") params.set("estado", "ocultos");

      const res = await fetch(`${API}/api/v1/admin/events?${params}`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      if (data.ok) { setEventos(data.events); setPagination(data.pagination); }
      if (data.stats) setStats(data.stats);
    } catch (err) {
      setError("No se pudieron cargar los eventos.");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, filterStatus]);

  useEffect(() => { fetchEventos(); }, [fetchEventos]);
  useEffect(() => { setPage(1); }, [searchQuery, filterStatus]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${API}/api/v1/admin/events/sync`, { method: "POST", headers: authHeaders() });
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

  const handleHide = (id: string) => {
    setModal({
      open: true,
      title: "Ocultar evento",
      description: "El evento dejará de aparecer en el listado público. Podrás restaurarlo cuando quieras.",
      confirmLabel: "Ocultar",
      danger: true,
      onConfirm: async () => {
        closeModal();
        try {
          const res = await fetch(`${API}/api/v1/admin/events/${id}/hide`, { method: "PATCH", headers: authHeaders() });
          if (!res.ok) throw new Error();
          await fetchEventos();
          toast.success("Evento ocultado");
        } catch { toast.error("Error al ocultar el evento"); }
      },
    });
  };

  const handleRestore = (id: string) => {
    setModal({
      open: true,
      title: "Restaurar evento",
      description: "El evento volverá a ser visible para todos los usuarios en el listado público.",
      confirmLabel: "Restaurar",
      danger: false,
      onConfirm: async () => {
        closeModal();
        try {
          const res = await fetch(`${API}/api/v1/admin/events/${id}/restore`, { method: "PATCH", headers: authHeaders() });
          if (!res.ok) throw new Error();
          await fetchEventos();
          toast.success("Evento restaurado");
        } catch { toast.error("Error al restaurar el evento"); }
      },
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black mb-1" style={{ color: "#f1f5f9" }}>Gestión de Eventos</h1>
          <p className="text-sm" style={{ color: "#94a3b8" }}>Administra los eventos deportivos importados de Zaragoza</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-bold transition-all disabled:opacity-70"
          style={{ backgroundColor: "#13ec80", color: "#0a1628" }}
        >
          {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {syncing ? "Sincronizando..." : "Sincronizar"}
        </button>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#13ec80" }} />
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#13ec80")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>
          <div style={selectWrap}>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-11 border-0 bg-transparent text-sm focus:ring-0" style={{ color: "#f1f5f9" }}>
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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total", value: pagination.total, color: "#f1f5f9" },
          { label: "Visibles", value: stats.visibles, color: "#13ec80" },
          { label: "Ocultos", value: stats.ocultos, color: "#f87171" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-xs font-semibold mb-1 uppercase tracking-widest" style={{ color: "#94a3b8" }}>{s.label}</p>
            <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#13ec80" }} />
        </div>
      )}
      {!loading && error && (
        <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Tabla */}
      {!loading && !error && (
        <>
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: "rgba(0,0,0,0.2)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <tr>
                    {["Evento", "Tipo", "Fecha", "Ubicación", "Estado", "Acciones"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest" style={{ color: "#94a3b8" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {eventos.map((evento) => (
                    <tr
                      key={evento.id}
                      className="transition-colors"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td className="px-5 py-4 max-w-xs">
                        <p className="font-semibold text-sm truncate" style={{ color: "#f1f5f9" }}>{evento.title}</p>
                        {evento.organizer && (
                          <p className="text-xs truncate" style={{ color: "#94a3b8" }}>{evento.organizer}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full" style={{ backgroundColor: "#13ec80", color: "#102219" }}>
                          {evento.tipo || "General"}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm" style={{ color: "#94a3b8" }}>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" style={{ color: "#13ec80" }} />
                          {evento.startDate ? format(new Date(evento.startDate), "d MMM yyyy", { locale: es }) : "-"}
                        </div>
                      </td>
                      <td className="px-5 py-4 max-w-xs">
                        {evento.ubicacion && (
                          <div className="flex items-center gap-1.5 text-sm" style={{ color: "#94a3b8" }}>
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#13ec80" }} />
                            <span className="truncate">{evento.ubicacion}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className="px-2 py-0.5 text-xs font-semibold rounded-full"
                          style={evento.oculto
                            ? { backgroundColor: "rgba(248,113,113,0.15)", color: "#f87171", border: "1px solid rgba(248,113,113,0.3)" }
                            : { backgroundColor: "rgba(19,236,128,0.12)", color: "#13ec80", border: "1px solid rgba(19,236,128,0.3)" }
                          }
                        >
                          {evento.oculto ? "Oculto" : "Visible"}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {evento.oculto ? (
                          <button
                            onClick={() => handleRestore(evento.id)}
                            title="Hacer visible"
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                            style={{ color: "#13ec80" }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(19,236,128,0.1)")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleHide(evento.id)}
                            title="Ocultar"
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                            style={{ color: "#f87171" }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(248,113,113,0.1)")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {eventos.length === 0 && (
                <div className="p-10 text-center text-sm" style={{ color: "#94a3b8" }}>
                  No hay eventos que coincidan con los filtros.
                </div>
              )}
            </div>
          </div>

          {/* Paginación */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm" style={{ color: "#94a3b8" }}>
                Página <span style={{ color: "#f1f5f9", fontWeight: 600 }}>{pagination.page}</span> de{" "}
                <span style={{ color: "#f1f5f9", fontWeight: 600 }}>{pagination.pages}</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 h-9 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 h-9 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {modal && (
        <ConfirmModal
          open={modal.open}
          title={modal.title}
          description={modal.description}
          confirmLabel={modal.confirmLabel}
          danger={modal.danger}
          onConfirm={modal.onConfirm}
          onCancel={closeModal}
        />
      )}
    </div>
  );
}