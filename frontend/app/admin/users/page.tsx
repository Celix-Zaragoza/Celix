"use client";

import { useEffect, useState, useCallback } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Search, CheckCircle, XCircle, Loader2, AlertCircle, Shield } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

export default function Page() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [page, setPage] = useState(1);

  // ── Cargar usuarios ───────────────────────────────────────────────────────
  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (searchQuery) params.set("q", searchQuery);
      if (filterStatus === "activos") params.set("estado", "activos");
      else if (filterStatus === "bloqueados") params.set("estado", "bloqueados");

      const res = await fetch(`${API}/api/v1/admin/users?${params}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      if (data.ok) {
        setUsuarios(data.users);
        setPagination(data.pagination);
      }
    } catch (err) {
      setError("No se pudieron cargar los usuarios.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, filterStatus]);

  useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);
  useEffect(() => { setPage(1); }, [searchQuery, filterStatus]);

  // ── Acciones ──────────────────────────────────────────────────────────────
  const handleBlock = async (id: string) => {
    try {
      const res = await fetch(`${API}/api/v1/admin/users/${id}/block`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error();
      setUsuarios((prev) => prev.map((u) => u.id === id ? { ...u, bloqueado: true } : u));
      toast.success("Usuario bloqueado");
    } catch {
      toast.error("Error al bloquear el usuario");
    }
  };

  const handleUnblock = async (id: string) => {
    try {
      const res = await fetch(`${API}/api/v1/admin/users/${id}/unblock`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error();
      setUsuarios((prev) => prev.map((u) => u.id === id ? { ...u, bloqueado: false } : u));
      toast.success("Usuario desbloqueado");
    } catch {
      toast.error("Error al desbloquear el usuario");
    }
  };

  const activos = usuarios.filter((u) => !u.bloqueado).length;
  const bloqueados = usuarios.filter((u) => u.bloqueado).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#f1f5f9] mb-2">Gestión de Usuarios</h1>
        <p className="text-[#94a3b8]">Administra los usuarios de la plataforma</p>
      </div>

      {/* Filtros */}
      <div className="bg-[#1e293b] rounded-xl shadow-sm border border-[rgba(148,163,184,0.2)] p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
            <Input
              type="text"
              placeholder="Buscar por nombre, alias o email..."
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
              <SelectItem value="activos">Activos</SelectItem>
              <SelectItem value="bloqueados">Bloqueados</SelectItem>
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
          <p className="text-sm text-[#94a3b8] mb-1">Activos</p>
          <p className="text-3xl font-bold text-[#13ec80]">{activos}</p>
        </div>
        <div className="bg-[#1e293b] rounded-lg border border-[rgba(148,163,184,0.2)] p-4">
          <p className="text-sm text-[#94a3b8] mb-1">Bloqueados</p>
          <p className="text-3xl font-bold text-red-400">{bloqueados}</p>
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
                    {["Usuario", "Email", "Rol", "Registro", "Estado", "Acciones"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-[#94a3b8] uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(148,163,184,0.2)]">
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-[#334155] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={usuario.avatar ?? `https://api.dicebear.com/7.x/initials/svg?seed=${usuario.nombre}`}
                            alt={usuario.nombre}
                            className="w-9 h-9 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium text-[#f1f5f9] text-sm">{usuario.nombre}</p>
                            <p className="text-xs text-[#94a3b8]">@{usuario.alias}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#94a3b8]">
                        {usuario.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {usuario.rol === "ADMIN" && (
                            <Shield className="w-3.5 h-3.5 text-[#13ec80]" />
                          )}
                          <span className={`text-xs font-semibold ${usuario.rol === "ADMIN" ? "text-[#13ec80]" : "text-[#94a3b8]"}`}>
                            {usuario.rol}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#94a3b8]">
                        {usuario.createdAt
                          ? format(new Date(usuario.createdAt), "d MMM yyyy", { locale: es })
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          usuario.bloqueado
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-[rgba(19,236,128,0.15)] text-[#13ec80] border border-[rgba(19,236,128,0.3)]"
                        }`}>
                          {usuario.bloqueado ? "Bloqueado" : "Activo"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {usuario.bloqueado ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUnblock(usuario.id)}
                              title="Desbloquear"
                              className="text-[#13ec80] hover:text-[#10d671]"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleBlock(usuario.id)}
                              title="Bloquear"
                              className="text-red-400 hover:text-red-300"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {usuarios.length === 0 && (
                <div className="p-8 text-center text-[#94a3b8]">
                  No hay usuarios que coincidan con los filtros.
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