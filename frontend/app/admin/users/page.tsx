/**
 * Archivo: /admin/users/page.tsx
 * Descripción: Página de administración de usuarios para el panel de Celix.
 *              Permite buscar, filtrar, bloquear y desbloquear usuarios.
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Search, CheckCircle, XCircle, Loader2, AlertCircle, Shield } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ConfirmModal } from "../../components/ConfirmModal";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface Usuario {
  id: string;
  alias: string;
  nombre: string;
  email: string;
  avatar?: string;
  rol: string;
  bloqueado: boolean;
  createdAt: string;
}

interface Pagination {
  page: number;
  pages: number;
  total: number;
}

/**
 * Genera las cabeceras HTTP estándar para las peticiones autenticadas.
 */
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
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState({ activos: 0, bloqueados: 0 });
  const [modal, setModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    danger: boolean;
    onConfirm: () => void;
  } | null>(null);

  /**
   * Cierra el modal de confirmación y limpia los datos asociados.
   */
  const closeModal = () => setModal(null);

  /**
   * Recupera la lista de usuarios del backend según los filtros y la página actual.
   */
  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (searchQuery) params.set("q", searchQuery);
      if (filterStatus === "activos") params.set("estado", "activos");
      else if (filterStatus === "bloqueados") params.set("estado", "bloqueados");

      const res = await fetch(`${API}/api/v1/admin/users?${params}`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      if (data.ok) { setUsuarios(data.users); setPagination(data.pagination); }
      if (data.stats) setStats(data.stats);
    } catch (err) {
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, filterStatus]);

  useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);
  useEffect(() => { setPage(1); }, [searchQuery, filterStatus]);

  /**
   * Muestra el modal de confirmación para bloquear a un usuario.
   */
  const handleBlock = (id: string) => {
    const usuario = usuarios.find((u) => u.id === id);
    if (usuario?.rol === "ADMIN") {
      toast.error("No puedes bloquear a un administrador");
      return;
    }
    setModal({
      open: true,
      title: "Bloquear usuario",
      description: "El usuario no podrá acceder a la plataforma ni usar sus funcionalidades mientras dure el bloqueo. Se le notificará por email.",
      confirmLabel: "Bloquear",
      danger: true,
      onConfirm: async () => {
        closeModal();
        try {
          const res = await fetch(`${API}/api/v1/admin/users/${id}/block`, { method: "PATCH", headers: authHeaders() });
          if (!res.ok) throw new Error();
          await fetchUsuarios();
          toast.success("Usuario bloqueado");
        } catch { toast.error("Error al bloquear el usuario"); }
      },
    });
  };

  /**
   * Muestra el modal de confirmación para desbloquear a un usuario.
   */
  const handleUnblock = (id: string) => {
    setModal({
      open: true,
      title: "Desbloquear usuario",
      description: "El usuario recuperará el acceso completo a la plataforma. Se le notificará por email.",
      confirmLabel: "Desbloquear",
      danger: false,
      onConfirm: async () => {
        closeModal();
        try {
          const res = await fetch(`${API}/api/v1/admin/users/${id}/unblock`, { method: "PATCH", headers: authHeaders() });
          if (!res.ok) throw new Error();
          await fetchUsuarios();
          toast.success("Usuario desbloqueado");
        } catch { toast.error("Error al desbloquear el usuario"); }
      },
    });
  };

  /**
   * Componente de página que renderiza la vista de administración de usuarios.
   */
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black mb-1" style={{ color: "#f1f5f9" }}>Gestión de Usuarios</h1>
        <p className="text-sm" style={{ color: "#94a3b8" }}>Administra los usuarios de la plataforma</p>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#13ec80" }} />
            <input
              type="text"
              placeholder="Buscar por nombre, alias o email..."
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
                <SelectItem value="activos">Activos</SelectItem>
                <SelectItem value="bloqueados">Bloqueados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total", value: pagination.total, color: "#f1f5f9" },
          { label: "Activos", value: stats.activos, color: "#13ec80" },
          { label: "Bloqueados", value: stats.bloqueados, color: "#f87171" },
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
                    {["Usuario", "Email", "Rol", "Registro", "Estado", "Acciones"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest" style={{ color: "#94a3b8" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr
                      key={usuario.id}
                      className="transition-colors"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={usuario.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${usuario.nombre}`}
                            alt={usuario.nombre}
                            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                            style={{ border: "2px solid rgba(19,236,128,0.3)" }}
                          />
                          <div>
                            <p className="font-semibold text-sm" style={{ color: "#f1f5f9" }}>{usuario.nombre}</p>
                            <p className="text-xs" style={{ color: "#94a3b8" }}>@{usuario.alias}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm" style={{ color: "#94a3b8" }}>
                        {usuario.email}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {usuario.rol === "ADMIN" && <Shield className="w-3.5 h-3.5" style={{ color: "#13ec80" }} />}
                          <span className="text-xs font-semibold" style={{ color: usuario.rol === "ADMIN" ? "#13ec80" : "#94a3b8" }}>
                            {usuario.rol}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm" style={{ color: "#94a3b8" }}>
                        {usuario.createdAt ? format(new Date(usuario.createdAt), "d MMM yyyy", { locale: es }) : "-"}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className="px-2 py-0.5 text-xs font-semibold rounded-full"
                          style={usuario.bloqueado
                            ? { backgroundColor: "rgba(248,113,113,0.15)", color: "#f87171", border: "1px solid rgba(248,113,113,0.3)" }
                            : { backgroundColor: "rgba(19,236,128,0.12)", color: "#13ec80", border: "1px solid rgba(19,236,128,0.3)" }
                          }
                        >
                          {usuario.bloqueado ? "Bloqueado" : "Activo"}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {usuario.bloqueado ? (
                          <button
                            onClick={() => handleUnblock(usuario.id)}
                            title="Desbloquear"
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                            style={{ color: "#13ec80" }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(19,236,128,0.1)")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBlock(usuario.id)}
                            title="Bloquear"
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                            style={{ color: "#f87171" }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(248,113,113,0.1)")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {usuarios.length === 0 && (
                <div className="p-10 text-center text-sm" style={{ color: "#94a3b8" }}>
                  No hay usuarios que coincidan con los filtros.
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