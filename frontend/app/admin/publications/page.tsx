"use client";

import { useEffect, useState, useCallback } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Search, Trash2, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

export default function Page() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("todas");
  const [page, setPage] = useState(1);

  // ── Cargar publicaciones ──────────────────────────────────────────────────
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (searchQuery) params.set("q", searchQuery);
      if (filterStatus === "activas") params.set("estado", "visibles");
      else if (filterStatus === "ocultas") params.set("estado", "ocultos");

      const res = await fetch(`${API}/api/v1/admin/posts?${params}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      if (data.ok) {
        setPosts(data.posts);
        setPagination(data.pagination);
      }
    } catch (err) {
      setError("No se pudieron cargar las publicaciones.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, filterStatus]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // Resetear página al cambiar filtros
  useEffect(() => { setPage(1); }, [searchQuery, filterStatus]);

  // ── Acciones ──────────────────────────────────────────────────────────────
  const handleHide = async (id: string) => {
    try {
      const res = await fetch(`${API}/api/v1/admin/posts/${id}/hide`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error();
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, oculto: true } : p));
      toast.success("Publicación ocultada");
    } catch {
      toast.error("Error al ocultar la publicación");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const res = await fetch(`${API}/api/v1/admin/posts/${id}/restore`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error();
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, oculto: false } : p));
      toast.success("Publicación restaurada");
    } catch {
      toast.error("Error al restaurar la publicación");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta publicación de forma permanente?")) return;
    try {
      const res = await fetch(`${API}/api/v1/admin/posts/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error();
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Publicación eliminada");
    } catch {
      toast.error("Error al eliminar la publicación");
    }
  };

  const visibles = posts.filter((p) => !p.oculto).length;
  const ocultas = posts.filter((p) => p.oculto).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#f1f5f9] mb-2">Gestión de Publicaciones</h1>
        <p className="text-[#94a3b8]">Administra las publicaciones de la plataforma</p>
      </div>

      {/* Filtros */}
      <div className="bg-[#1e293b] rounded-xl shadow-sm border border-[rgba(148,163,184,0.2)] p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
            <Input
              type="text"
              placeholder="Buscar publicaciones..."
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
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="activas">Visibles</SelectItem>
              <SelectItem value="ocultas">Ocultas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1e293b] rounded-lg border border-[rgba(148,163,184,0.2)] p-4">
          <p className="text-sm text-[#94a3b8] mb-1">Total (página)</p>
          <p className="text-3xl font-bold text-[#f1f5f9]">{pagination.total}</p>
        </div>
        <div className="bg-[#1e293b] rounded-lg border border-[rgba(148,163,184,0.2)] p-4">
          <p className="text-sm text-[#94a3b8] mb-1">Visibles</p>
          <p className="text-3xl font-bold text-[#13ec80]">{visibles}</p>
        </div>
        <div className="bg-[#1e293b] rounded-lg border border-[rgba(148,163,184,0.2)] p-4">
          <p className="text-sm text-[#94a3b8] mb-1">Ocultas</p>
          <p className="text-3xl font-bold text-red-400">{ocultas}</p>
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
                    {["Usuario", "Contenido", "Deporte", "Likes", "Fecha", "Estado", "Acciones"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-[#94a3b8] uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(148,163,184,0.2)]">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-[#334155] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={post.autor?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${post.autor?.nombre}`}
                            alt={post.autor?.nombre}
                            className="w-28 h-28 rounded-full object-cover border-4 border-[#13ec80]/30"
                          />
                          <div>
                            <p className="font-medium text-[#f1f5f9] text-sm">{post.autor?.nombre}</p>
                            <p className="text-xs text-[#94a3b8]">@{post.autor?.alias}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-sm text-[#f1f5f9] truncate">{post.contenido}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-[#13ec80] text-[#102219] text-xs font-semibold rounded-full">
                          {post.deporte}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#94a3b8]">
                        ❤️ {post.numLikes ?? 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#94a3b8]">
                        {post.createdAt
                          ? format(new Date(post.createdAt), "d MMM yyyy", { locale: es })
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          post.oculto
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-[rgba(19,236,128,0.15)] text-[#13ec80] border border-[rgba(19,236,128,0.3)]"
                        }`}>
                          {post.oculto ? "Oculta" : "Visible"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {post.oculto ? (
                            <Button size="sm" variant="ghost" onClick={() => handleRestore(post.id)} title="Restaurar" className="text-[#13ec80] hover:text-[#10d671]">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => handleHide(post.id)} title="Ocultar" className="text-red-400 hover:text-red-300">
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(post.id)} title="Eliminar" className="text-[#94a3b8] hover:text-[#f1f5f9]">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {posts.length === 0 && (
                <div className="p-8 text-center text-[#94a3b8]">No hay publicaciones que coincidan con los filtros.</div>
              )}
            </div>
          </div>

          {/* Paginación */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-[#94a3b8]">
                Página <span className="text-[#f1f5f9] font-medium">{pagination.page}</span> de <span className="text-[#f1f5f9] font-medium">{pagination.pages}</span>
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="border-[rgba(148,163,184,0.2)] text-[#94a3b8] disabled:opacity-40">
                  ← Anterior
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="border-[rgba(148,163,184,0.2)] text-[#94a3b8] disabled:opacity-40">
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