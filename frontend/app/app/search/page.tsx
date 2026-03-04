"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mockUsuarios } from "../../data/mockData";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Search, UserPlus } from "lucide-react";

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [usuarios, setUsuarios] = useState(mockUsuarios);
  const router = useRouter();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setUsuarios(mockUsuarios);
    } else {
      const filtered = mockUsuarios.filter(
        (u) =>
          u.nombre.toLowerCase().includes(query.toLowerCase()) ||
          u.alias.toLowerCase().includes(query.toLowerCase()) ||
          u.deportes.some((d) => d.toLowerCase().includes(query.toLowerCase()))
      );
      setUsuarios(filtered);
    }
  };

  const goProfile = (id: string | number) => router.push(`/app/profile/${id}`);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#f1f5f9] mb-2">Buscar usuarios</h1>
        <p className="text-[#94a3b8]">Encuentra deportistas en Zaragoza</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
        <Input
          type="text"
          placeholder="Buscar por nombre, alias o deporte..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-12 h-14 text-lg"
        />
      </div>

      {/* Results */}
      <div className="space-y-3">
        {usuarios.length > 0 ? (
          usuarios.map((usuario) => (
            <div
              key={usuario.id}
              className="bg-[#1e293b] rounded-xl shadow-sm border border-[rgba(148,163,184,0.2)] p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <img
                  src={usuario.avatar}
                  alt={usuario.nombre}
                  className="w-16 h-16 rounded-full object-cover cursor-pointer"
                  onClick={() => goProfile(usuario.id)}
                />
                <div className="flex-1">
                  <h3
                    className="font-bold text-[#f1f5f9] cursor-pointer hover:underline"
                    onClick={() => goProfile(usuario.id)}
                  >
                    {usuario.nombre}
                  </h3>
                  <p className="text-sm text-[#94a3b8]">@{usuario.alias}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {usuario.deportes.slice(0, 3).map((deporte) => (
                      <span
                        key={deporte}
                        className="px-2 py-0.5 bg-[#13ec80] text-[#102219] text-xs font-medium rounded-full"
                      >
                        {deporte}
                      </span>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={() => goProfile(usuario.id)}
                  size="sm"
                  className="bg-[#13ec80] text-[#102219] hover:bg-[#10d671]"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Ver perfil
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-[#1e293b] rounded-xl shadow-sm border border-[rgba(148,163,184,0.2)] p-12 text-center">
            <Search className="w-16 h-16 text-[#94a3b8] mx-auto mb-4" />
            <p className="text-[#94a3b8]">No se encontraron usuarios</p>
          </div>
        )}
      </div>
    </div>
  );
}