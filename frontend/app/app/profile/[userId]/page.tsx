"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { Button } from "../../../components/ui/button";
import { MapPin, Calendar, MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const API = "http://localhost:3001/api/v1";

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

export default function Page() {
  const router = useRouter();
  const { user: me } = useAuth();
  const params = useParams<{ userId: string }>();
  const userId = params?.userId;

  const [usuario, setUsuario] = useState<any>(null);
  const [siguiendo, setSiguiendo] = useState(false);
  const [seguidores, setSeguidores] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingFollow, setLoadingFollow] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Si es mi propio perfil, redirigir
    if (me?.id && userId === me.id) {
      router.replace("/app/profile");
      return;
    }

    const fetchUsuario = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/users/${userId}`, { headers: authHeaders() });
        if (!res.ok) {
          toast.error("Usuario no encontrado");
          router.push("/app/feed");
          return;
        }
        const data = await res.json();
        setUsuario(data.user);
        setSiguiendo(data.user.siguiendo ?? false);
        setSeguidores(data.user.seguidores ?? false);
      } catch {
        toast.error("Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchUsuario();
  }, [userId, me?.id]);

  const handleToggleSeguir = async () => {
    if (!usuario) return;
    setLoadingFollow(true);
    try {
      const method = siguiendo ? "DELETE" : "POST";
      const res = await fetch(`${API}/users/${userId}/follow`, {
        method,
        headers: authHeaders(),
      });
      if (res.ok) {
        setSiguiendo(!siguiendo);
        setUsuario((prev: any) => ({
          ...prev,
          numSeguidores: siguiendo ? prev.numSeguidores - 1 : prev.numSeguidores + 1,
        }));
        toast.success(
          siguiendo ? `Dejaste de seguir a ${usuario.nombre}` : `Ahora sigues a ${usuario.nombre}`
        );
      } else {
        const data = await res.json();
        toast.error(data.message || "Error al actualizar seguimiento");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoadingFollow(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#13ec80]" />
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="text-center py-12">
        <p className="text-[#94a3b8]">Usuario no encontrado</p>
        <Button onClick={() => router.push("/app/feed")} className="mt-4">
          Volver al feed
        </Button>
      </div>
    );
  }

  const deportesNivel = usuario.deportesNivel ?? [];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-[#1e293b] rounded-xl border border-[rgba(148,163,184,0.2)] p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <img
            src={usuario.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${usuario.nombre}`}
            alt={usuario.nombre}
            className="w-28 h-28 rounded-full object-cover border-4 border-[#13ec80]/30"
          />
          <div className="flex-1">
            {/* Nombre + botones */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
              <div>
                <h1 className="text-2xl font-bold text-[#f1f5f9]">{usuario.nombre}</h1>
                <p className="text-[#94a3b8]">@{usuario.alias}</p>
              </div>
              <div className="flex gap-2 mt-3 md:mt-0">
                <Button
                  onClick={handleToggleSeguir}
                  disabled={loadingFollow}
                  className={
                    siguiendo
                      ? "border border-[#334155] bg-transparent text-[#94a3b8] hover:bg-[#334155] hover:text-white"
                      : "bg-[#13ec80] text-[#102219] hover:bg-[#10d671]"
                  }
                >
                  {loadingFollow
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : siguiendo ? "Siguiendo" : "Seguir"
                  }
                </Button>
                <Button
                  variant="outline"
                  className="border-[#334155] text-[#94a3b8] hover:bg-[#334155]"
                  onClick={() => router.push("/app/messages")}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Mensaje
                </Button>
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#94a3b8] mb-3">
              {usuario.zona && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{usuario.zona}</span>
                </div>
              )}
              {usuario.edad && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{usuario.edad} años</span>
                </div>
              )}
            </div>

            {usuario.bio && <p className="text-[#f1f5f9] mb-4">{usuario.bio}</p>}

            {/* Contadores */}
            <div className="flex gap-6">
              <div className="text-center">
                <span className="font-bold text-[#f1f5f9]">{usuario.numSeguidores ?? 0}</span>
                <span className="text-[#94a3b8] ml-1 text-sm">Seguidores</span>
              </div>
              <div className="text-center">
                <span className="font-bold text-[#f1f5f9]">{usuario.numSiguiendo ?? 0}</span>
                <span className="text-[#94a3b8] ml-1 text-sm">Siguiendo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Deportes */}
        {deportesNivel.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-[rgba(148,163,184,0.1)]">
            {deportesNivel.map((d: any) => (
              <span
                key={d.deporte}
                className="px-3 py-1 bg-[#13ec80]/10 text-[#13ec80] border border-[#13ec80]/20 rounded-full text-sm font-medium"
              >
                {d.deporte} · Nv.{d.nivel}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Publicaciones — pendiente hasta implementar posts */}
      <div>
        <h2 className="text-xl font-bold text-[#f1f5f9] mb-4">Publicaciones</h2>
        <div className="bg-[#1e293b] rounded-xl border border-[rgba(148,163,184,0.2)] p-12 text-center">
          <p className="text-[#94a3b8]">Las publicaciones estarán disponibles próximamente</p>
        </div>
      </div>
    </div>
  );
}