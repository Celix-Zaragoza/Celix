"use client";

import { useState } from "react";
import { mockPublicaciones } from "../../data/mockData";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Search, Trash2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

type PublicacionWithStatus = (typeof mockPublicaciones)[number] & { status: "activa" | "inactiva" };

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todas");
  const [publicaciones, setPublicaciones] = useState<PublicacionWithStatus[]>(
    mockPublicaciones.map((p) => ({ ...p, status: "activa" }))
  );

  const filteredPublicaciones = publicaciones.filter((pub) => {
    const matchesSearch =
      pub.contenido.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pub.usuarioNombre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "todas" || pub.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleChangeStatus = (id: string | number, newStatus: "activa" | "inactiva") => {
    setPublicaciones((prev) =>
      prev.map((p) => (String(p.id) === String(id) ? { ...p, status: newStatus } : p))
    );
    toast.success(`Publicación ${newStatus === "activa" ? "aprobada" : "rechazada"}`);
  };

  const handleDelete = (id: string | number) => {
    setPublicaciones((prev) => prev.filter((p) => String(p.id) !== String(id)));
    toast.success("Publicación eliminada");
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#f1f5f9] mb-2">Gestión de Publicaciones</h1>
        <p className="text-[#94a3b8]">Administra las publicaciones de la plataforma</p>
      </div>

      {/* Filters */}
      <div className="bg-[#1e293b] rounded-xl shadow-sm border border-[rgba(148,163,184,0.2)] p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
            <Input
              type="text"
              placeholder="Buscar publicaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="activa">Activas</SelectItem>
              <SelectItem value="inactiva">Inactivas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1e293b] rounded-lg shadow-sm border border-[rgba(148,163,184,0.2)] p-4">
          <p className="text-sm text-[#94a3b8] mb-1">Total</p>
          <p className="text-3xl font-bold text-[#f1f5f9]">{publicaciones.length}</p>
        </div>

        <div className="bg-[#1e293b] rounded-lg shadow-sm border border-[rgba(148,163,184,0.2)] p-4">
          <p className="text-sm text-[#94a3b8] mb-1">Activas</p>
          <p className="text-3xl font-bold text-[#13ec80]">
            {publicaciones.filter((p) => p.status === "activa").length}
          </p>
        </div>

        <div className="bg-[#1e293b] rounded-lg shadow-sm border border-[rgba(148,163,184,0.2)] p-4">
          <p className="text-sm text-[#94a3b8] mb-1">Inactivas</p>
          <p className="text-3xl font-bold text-red-400">
            {publicaciones.filter((p) => p.status === "inactiva").length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1e293b] rounded-xl shadow-sm border border-[rgba(148,163,184,0.2)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0f172a] border-b border-[rgba(148,163,184,0.2)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#94a3b8] uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#94a3b8] uppercase tracking-wider">
                  Contenido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#94a3b8] uppercase tracking-wider">
                  Deporte
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#94a3b8] uppercase tracking-wider">
                  Estadísticas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#94a3b8] uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#94a3b8] uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="bg-[#1e293b] divide-y divide-[rgba(148,163,184,0.2)]">
              {filteredPublicaciones.map((pub) => (
                <tr key={pub.id} className="hover:bg-[#334155]">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={pub.usuarioAvatar}
                        alt={pub.usuarioNombre}
                        className="w-10 h-10 rounded-full object-cover mr-3"
                      />
                      <div>
                        <p className="font-medium text-[#f1f5f9]">{pub.usuarioNombre}</p>
                        <p className="text-sm text-[#94a3b8]">@{pub.usuarioAlias}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-sm text-[#f1f5f9] max-w-xs truncate">{pub.contenido}</p>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-[#13ec80] text-[#102219] text-xs font-medium rounded-full">
                      {pub.deporte}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#94a3b8]">
                    <div>❤️ {pub.likes}</div>
                    <div>💬 {pub.comentarios}</div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        pub.status === "activa" ? "bg-[#13ec80] text-[#102219]" : "bg-red-500 text-white"
                      }`}
                    >
                      {pub.status === "activa" ? "Activa" : "Inactiva"}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      {pub.status === "activa" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleChangeStatus(pub.id, "inactiva")}
                          title="Desactivar"
                          className="text-red-400 hover:text-red-300"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleChangeStatus(pub.id, "activa")}
                          title="Activar"
                          className="text-[#13ec80] hover:text-[#10d671]"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(pub.id)}
                        title="Eliminar"
                        className="text-[#94a3b8] hover:text-[#f1f5f9]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPublicaciones.length === 0 && (
            <div className="p-8 text-center text-[#94a3b8]">No hay publicaciones que coincidan con los filtros.</div>
          )}
        </div>
      </div>
    </div>
  );
}