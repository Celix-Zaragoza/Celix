"use client";

import { useState } from "react";
import { mockEventos } from "../../data/mockData";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Search, Trash2, CheckCircle, XCircle, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type EventoWithStatus = (typeof mockEventos)[number] & { status: "activo" | "inactivo" };

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [eventos, setEventos] = useState<EventoWithStatus[]>(
    mockEventos.map((e) => ({ ...e, status: "activo" }))
  );

  const filteredEventos = eventos.filter((event) => {
    const matchesSearch =
      event.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.descripcion.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "todos" || event.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleChangeStatus = (id: string | number, newStatus: "activo" | "inactivo") => {
    setEventos((prev) => prev.map((e) => (String(e.id) === String(id) ? { ...e, status: newStatus } : e)));
    toast.success(`Evento ${newStatus === "activo" ? "activado" : "desactivado"}`);
  };

  const handleDelete = (id: string | number) => {
    setEventos((prev) => prev.filter((e) => String(e.id) !== String(id)));
    toast.success("Evento eliminado");
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Eventos</h1>
        <p className="text-gray-600">Administra los eventos deportivos de la plataforma</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar eventos..."
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
          <p className="text-sm text-gray-600 mb-1">Total de Eventos</p>
          <p className="text-3xl font-bold text-gray-900">{eventos.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Activos</p>
          <p className="text-3xl font-bold text-green-600">{eventos.filter((e) => e.status === "activo").length}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Participantes Totales</p>
          <p className="text-3xl font-bold text-blue-600">{eventos.reduce((sum, e) => sum + e.participantes, 0)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deporte</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha y Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participantes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEventos.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{event.nombre}</p>
                      <p className="text-sm text-gray-500 max-w-xs truncate">{event.descripcion}</p>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {event.deporte}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      <div>
                        <div>{format(new Date(event.fecha), "d 'de' MMMM", { locale: es })}</div>
                        <div className="text-xs text-gray-500">{event.hora}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">{event.ubicacion}</td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(event.participantes / event.maxParticipantes) * 100}%` }}
                        />
                      </div>
                      <span>
                        {event.participantes}/{event.maxParticipantes}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        event.status === "activo" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {event.status === "activo" ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      {event.status === "activo" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleChangeStatus(event.id, "inactivo")}
                          title="Desactivar"
                        >
                          <XCircle className="w-4 h-4 text-red-600" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleChangeStatus(event.id, "activo")}
                          title="Activar"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </Button>
                      )}

                      <Button size="sm" variant="ghost" onClick={() => handleDelete(event.id)} title="Eliminar">
                        <Trash2 className="w-4 h-4 text-gray-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEventos.length === 0 && (
            <div className="p-8 text-center text-gray-500">No hay eventos que coincidan con los filtros.</div>
          )}
        </div>
      </div>
    </div>
  );
}