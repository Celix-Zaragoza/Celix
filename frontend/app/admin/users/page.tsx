"use client";

import { useState } from "react";
import { mockUsuarios } from "../../data/mockData";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Search, Trash2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

type UsuarioWithStatus = (typeof mockUsuarios)[number] & { status: "activo" | "inactivo" };

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [usuarios, setUsuarios] = useState<UsuarioWithStatus[]>(
    mockUsuarios.map((u) => ({ ...u, status: "activo" }))
  );

  const filteredUsuarios = usuarios.filter((user) => {
    const matchesSearch =
      user.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.alias.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "todos" || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleChangeStatus = (id: string | number, newStatus: "activo" | "inactivo") => {
    setUsuarios((prev) => prev.map((u) => (String(u.id) === String(id) ? { ...u, status: newStatus } : u)));
    toast.success(`Usuario ${newStatus === "activo" ? "activado" : "desactivado"}`);
  };

  const handleDelete = (id: string | number) => {
    setUsuarios((prev) => prev.filter((u) => String(u.id) !== String(id)));
    toast.success("Usuario eliminado");
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Usuarios</h1>
        <p className="text-gray-600">Administra los usuarios de la plataforma</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar usuarios..."
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
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="activo">Activos</SelectItem>
              <SelectItem value="inactivo">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total de Usuarios</p>
          <p className="text-3xl font-bold text-gray-900">{usuarios.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Activos</p>
          <p className="text-3xl font-bold text-green-600">{usuarios.filter((u) => u.status === "activo").length}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Inactivos</p>
          <p className="text-3xl font-bold text-red-600">{usuarios.filter((u) => u.status === "inactivo").length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zona</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deportes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actividad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsuarios.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img src={user.avatar} alt={user.nombre} className="w-10 h-10 rounded-full object-cover mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{user.nombre}</p>
                        <p className="text-sm text-gray-500">@{user.alias}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.zona}</td>

                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.deportes.slice(0, 2).map((deporte) => (
                        <span
                          key={deporte}
                          className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
                        >
                          {deporte}
                        </span>
                      ))}
                      {user.deportes.length > 2 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          +{user.deportes.length - 2}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div>👥 {user.seguidores} seguidores</div>
                    <div>📝 {user.publicaciones} posts</div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.status === "activo" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.status === "activo" ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      {user.status === "activo" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleChangeStatus(user.id, "inactivo")}
                          title="Desactivar"
                        >
                          <XCircle className="w-4 h-4 text-red-600" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleChangeStatus(user.id, "activo")}
                          title="Activar"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </Button>
                      )}

                      <Button size="sm" variant="ghost" onClick={() => handleDelete(user.id)} title="Eliminar">
                        <Trash2 className="w-4 h-4 text-gray-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsuarios.length === 0 && (
            <div className="p-8 text-center text-gray-500">No hay usuarios que coincidan con los filtros.</div>
          )}
        </div>
      </div>
    </div>
  );
}