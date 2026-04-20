"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, UserPlus } from "lucide-react";

type DeporteNivel = {
  deporte: string;
  nivel: string;
};

type Usuario = {
  id: string;
  nombre: string;
  alias: string;
  avatar: string;
  deportesNivel: DeporteNivel[];
  numSeguidores: number;
  numSiguiendo: number;
  siguiendo: boolean;
  zona: string;
};

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim() === "") {
        setUsuarios([]);
      } else {
        fetchUsuarios(searchQuery);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const fetchUsuarios = async (query: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/v1/users/search?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al buscar usuarios");
      const data = await res.json();
      setUsuarios(data.users);
    } catch (error) {
      console.error(error);
      setUsuarios([]);
    }
  };

  const goProfile = (id: string | number) => router.push(`/app/profile/${id}`);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black mb-1" style={{ color: "#f1f5f9" }}>
          Buscar usuarios
        </h1>
        <p className="text-sm" style={{ color: "#94a3b8" }}>
          Encuentra deportistas en Zaragoza
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
          style={{ color: "#13ec80" }}
        />
        <input
          type="text"
          placeholder="Buscar por nombre, alias o deporte..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 pl-12 pr-4 rounded-xl text-sm outline-none transition-all"
          style={{
            backgroundColor: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#f1f5f9",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#13ec80")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
        />
      </div>

      {/* Results */}
      <div className="space-y-3">
        {usuarios.length > 0 ? (
          usuarios.map((usuario) => (
            <div
              key={usuario.id}
              className="rounded-2xl p-4 transition-all cursor-pointer"
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(19,236,128,0.3)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
              onClick={() => goProfile(usuario.id)}
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <img
                  src={
                    usuario.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${usuario.nombre}`
                  }
                  alt={usuario.nombre}
                  className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                  style={{ border: "2px solid rgba(19,236,128,0.4)" }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-sm truncate" style={{ color: "#f1f5f9" }}>
                      {usuario.nombre}
                    </h3>
                    {usuario.zona && (
                      <span className="flex items-center gap-1 text-xs flex-shrink-0" style={{ color: "#94a3b8" }}>
                        <MapPin className="w-3 h-3" />
                        {usuario.zona}
                      </span>
                    )}
                  </div>
                  <p className="text-xs mb-2" style={{ color: "#94a3b8" }}>
                    @{usuario.alias}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {usuario.deportesNivel?.slice(0, 3).map((d) => (
                      <span
                        key={d.deporte}
                        className="px-2 py-0.5 text-xs font-semibold rounded-full"
                        style={{
                          backgroundColor: "rgba(19,236,128,0.12)",
                          color: "#13ec80",
                          border: "1px solid rgba(19,236,128,0.25)",
                        }}
                      >
                        {d.deporte}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Botón */}
                <button
                  onClick={(e) => { e.stopPropagation(); goProfile(usuario.id); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold flex-shrink-0 transition-all"
                  style={{
                    backgroundColor: "rgba(19,236,128,0.12)",
                    color: "#13ec80",
                    border: "1px solid rgba(19,236,128,0.25)",
                  }}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Ver perfil
                </button>
              </div>
            </div>
          ))
        ) : searchQuery ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{
              backgroundColor: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <Search className="w-12 h-12 mx-auto mb-3" style={{ color: "rgba(148,163,184,0.3)" }} />
            <p className="text-sm" style={{ color: "#94a3b8" }}>
              No se encontraron usuarios para <span style={{ color: "#f1f5f9" }}>&quot;{searchQuery}&quot;</span>
            </p>
          </div>
        ) : (
          <div
            className="rounded-2xl p-12 text-center"
            style={{
              backgroundColor: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <Search className="w-12 h-12 mx-auto mb-3" style={{ color: "rgba(148,163,184,0.3)" }} />
            <p className="text-sm" style={{ color: "#94a3b8" }}>
              Escribe un nombre o alias para buscar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}