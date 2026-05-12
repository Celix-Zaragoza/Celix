/**
 * Archivo: frontend/app/app/followers/page.tsx
 * Descripción: Página que muestra los seguidores del usuario y permite buscar entre ellos.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mockUsuarios } from "../../data/mockData";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Search } from "lucide-react";
import { toast } from "sonner";

type MockUsuario = (typeof mockUsuarios)[number];

/**
 * Componente de página de /app/followers que lista los seguidores del usuario.
 */
export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [seguidores] = useState(mockUsuarios.slice(0, 4));
  const router = useRouter();

  const filteredSeguidores = searchQuery
    ? seguidores.filter(
        (u) =>
          u.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.alias.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : seguidores;

  /**
   * Simula el seguimiento de un usuario y muestra una notificación.
   */
  const handleSeguir = (usuario: MockUsuario) => {
    toast.success(`Ahora sigues a ${usuario.nombre}`);
  };

  /**
   * Navega al perfil público del usuario seleccionado.
   */
  const goProfile = (id: string | number) => router.push(`/app/profile/${id}`);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Seguidores</h1>
        <p className="text-gray-600">{seguidores.length} personas te siguen</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar seguidores..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12"
        />
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y">
        {filteredSeguidores.map((usuario) => (
          <div key={usuario.id} className="p-4 flex items-center gap-4">
            <img
              src={usuario.avatar}
              alt={usuario.nombre}
              className="w-14 h-14 rounded-full object-cover cursor-pointer"
              onClick={() => goProfile(usuario.id)}
            />
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 cursor-pointer hover:underline" onClick={() => goProfile(usuario.id)}>
                {usuario.nombre}
              </h3>
              <p className="text-sm text-gray-600">@{usuario.alias}</p>
              <p className="text-xs text-gray-500 mt-1">{usuario.zona}</p>
            </div>
            <Button onClick={() => handleSeguir(usuario)} size="sm">
              Seguir
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}