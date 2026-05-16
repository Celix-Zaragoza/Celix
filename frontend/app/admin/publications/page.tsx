/**
 * Archivo: /admin/publications/page.tsx
 * Descripción: Página de administración de publicaciones del panel de admin de Celix.
 *              Permite buscar, filtrar, ocultar, restaurar y eliminar publicaciones.
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Search, Trash2, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ConfirmModal } from "../../components/ConfirmModal";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface Post {
  id: string;
  contenido: string;
  deporte: string;
  tipo: string;
  oculto: boolean;
  eliminado: boolean;
  numLikes: number;
  createdAt: string;
  autor: {
    id: string;
    alias: string;
    nombre: string;
    avatar?: string;
  };
}

interface Pagination {
  page: number;
  pages: number;
  total: number;
}

/**
 * Genera las cabeceras HTTP necesarias para las peticiones autenticadas al backend.
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("todas");
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState({ visibles: 0, ocultas: 0 });
  const [modal, setModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    danger: boolean;
    onConfirm: () => void;
  } | null>(null);

  /**
   * Cierra el modal de confirmación y limpia su estado.
   */
  const closeModal = () => setModal(null);

  /**
   * Obtiene la lista de publicaciones desde el backend según los filtros y la página actual.
   */
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (searchQuery) params.set("q", searchQuery);
      if (filterStatus === "activas") params.set("estado", "visibles");
      else if (filterStatus === "ocultas") params.set("estado", "ocultos");

      const res = await fetch(`${API}/api/v1/admin/posts?${params}`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      if (data.ok) { setPosts(data.posts); setPagination(data.pagination); }
      if (data.stats) setStats(data.stats);
    } catch (err) {
      setError("No se pudieron cargar las publicaciones.");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, filterStatus]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);
  useEffect(() => { setPage(1); }, [searchQuery, filterStatus]);

  /**
   * Muestra el modal de confirmación para ocultar una publicación.
   */
  const handleHide = (id: string) => {
    setModal({
      open: true,
      title: "Ocultar publicación",
      description: "La publicación dejará de ser visible para los usuarios. Podrás restaurarla después.",
      confirmLabel: "Ocultar",
      danger: true,
      onConfirm: async () => {
        closeModal();
        try {
          const res = await fetch(`${API}/api/v1/admin/posts/${id}/hide`, { method: "PATCH", headers: authHeaders() });
          if (!res.ok) throw new Error();
          await fetchPosts();
          toast.success("Publicación ocultada");
        } catch { toast.error("Error al ocultar la publicación"); }
      },
    });
  };

  /**
   * Muestra el modal de confirmación para restaurar una publicación oculta.
   */
  const handleRestore = (id: string) => {
    setModal({
      open: true,
      title: "Restaurar publicación",
      description: "La publicación volverá a ser visible para todos los usuarios.",
      confirmLabel: "Restaurar",
      danger: false,
      onConfirm: async () => {
        closeModal();
        try {
          const res = await fetch(`${API}/api/v1/admin/posts/${id}/restore`, { method: "PATCH", headers: authHeaders() });
          if (!res.ok) throw new Error();
          await fetchPosts();
          toast.success("Publicación restaurada");
        } catch { toast.error("Error al restaurar la publicación"); }
      },
    });
  };

  /**
   * Muestra el modal de confirmación para eliminar permanentemente una publicación.
   */
  const handleDelete = (id: string) => {
    setModal({
      open: true,
      title: "Eliminar publicación",
      description: "Esta acción es permanente y no se puede deshacer. La publicación se eliminará de forma definitiva.",
      confirmLabel: "Eliminar",
      danger: true,
      onConfirm: async () => {
        closeModal();
        try {
          const res = await fetch(`${API}/api/v1/admin/posts/${id}`, { method: "DELETE", headers: authHeaders() });
          if (!res.ok) throw new Error();
          await fetchPosts();
          toast.success("Publicación eliminada");
        } catch { toast.error("Error al eliminar la publicación"); }
      },
    });
  };

  /**
   * Componente de página que renderiza la vista de administración de publicaciones.
   */
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black mb-1" style={{ color: "#f1f5f9" }}>Gestión de Publicaciones</h1>
        <p className="text-sm" style={{ color: "#94a3b8" }}>Administra las publicaciones de la plataforma</p>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#13ec80" }} />
            <input
              type="text"
              placeholder="Buscar publicaciones..."
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
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="activas">Visibles</SelectItem>
                <SelectItem value="ocultas">Ocultas</SelectItem>
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
          { label: "Ocultas", value: stats.ocultas, color: "#f87171" },
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
                    {["Usuario", "Contenido", "Deporte", "Likes", "Fecha", "Estado", "Acciones"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest" style={{ color: "#94a3b8" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr
                      key={post.id}
                      className="transition-colors"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={post.autor?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${post.autor?.nombre}`}
                            alt={post.autor?.nombre}
                            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                            style={{ border: "2px solid rgba(19,236,128,0.3)" }}
                          />
                          <div>
                            <p className="font-semibold text-sm" style={{ color: "#f1f5f9" }}>{post.autor?.nombre}</p>
                            <p className="text-xs" style={{ color: "#94a3b8" }}>@{post.autor?.alias}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 max-w-xs">
                        <p className="text-sm truncate" style={{ color: "#e2e8f0" }}>{post.contenido}</p>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full" style={{ backgroundColor: "#13ec80", color: "#102219" }}>
                          {post.deporte}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm" style={{ color: "#94a3b8" }}>
                        ❤️ {post.numLikes ?? 0}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm" style={{ color: "#94a3b8" }}>
                        {post.createdAt ? format(new Date(post.createdAt), "d MMM yyyy", { locale: es }) : "-"}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className="px-2 py-0.5 text-xs font-semibold rounded-full"
                          style={post.oculto
                            ? { backgroundColor: "rgba(248,113,113,0.15)", color: "#f87171", border: "1px solid rgba(248,113,113,0.3)" }
                            : { backgroundColor: "rgba(19,236,128,0.12)", color: "#13ec80", border: "1px solid rgba(19,236,128,0.3)" }
                          }
                        >
                          {post.oculto ? "Oculta" : "Visible"}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {post.oculto ? (
                            <button onClick={() => handleRestore(post.id)} title="Restaurar" className="w-8 h-8 rounded-lg flex items-center justify-center transition-all" style={{ color: "#13ec80" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(19,236,128,0.1)")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          ) : (
                            <button onClick={() => handleHide(post.id)} title="Ocultar" className="w-8 h-8 rounded-lg flex items-center justify-center transition-all" style={{ color: "#f87171" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(248,113,113,0.1)")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => handleDelete(post.id)} title="Eliminar" className="w-8 h-8 rounded-lg flex items-center justify-center transition-all" style={{ color: "#94a3b8" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(148,163,184,0.1)")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {posts.length === 0 && (
                <div className="p-10 text-center text-sm" style={{ color: "#94a3b8" }}>
                  No hay publicaciones que coincidan con los filtros.
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