/**
 * Archivo: frontend/app/app/profile/[userId]/page.tsx
 * Descripción: Perfil público de otro usuario con opción para seguir o dejar de seguir.
 */

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { PublicationCard } from "../../../components/PublicationCard";
import { MapPin, Calendar, MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/**
 * Genera las cabeceras HTTP para peticiones autenticadas en el perfil de usuario.
 */
function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

/**
 * Componente de página de /app/profile/[userId] que muestra un perfil ajeno.
 */
export default function Page() {
  const router = useRouter();
  const { user: me } = useAuth();
  const params = useParams<{ userId: string }>();
  const userId = params?.userId;

  const [usuario, setUsuario] = useState<any>(null);
  const [siguiendo, setSiguiendo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    if (!userId) return;
    if (me?.id && userId === me.id) {
      router.replace("/app/profile");
      return;
    }

    /**
     * Obtiene los datos del usuario solicitado por su identificador.
     */
    const fetchUsuario = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/v1/users/${userId}`, { headers: authHeaders() });
        if (!res.ok) {
          toast.error("Usuario no encontrado");
          router.push("/app/feed");
          return;
        }
        const data = await res.json();
        setUsuario(data.user);
        setSiguiendo(data.user.siguiendo ?? false);
      } catch {
        toast.error("Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchUsuario();
  }, [userId, me?.id]);

  useEffect(() => {
    if (!userId) return;
    /**
     * Recupera las publicaciones del usuario cuyo perfil se está visualizando.
     */
    const fetchPosts = async () => {
      setLoadingPosts(true);
      try {
        const res = await fetch(`${API}/api/v1/posts/user/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts ?? []);
        }
      } catch {
        // silencioso
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchPosts();
  }, [userId]);

  /**
   * Cambia el estado de seguimiento del usuario actualmente visualizado.
   */
  const handleToggleSeguir = async () => {
    if (!usuario) return;
    setLoadingFollow(true);
    try {
      const method = siguiendo ? "DELETE" : "POST";
      const res = await fetch(`${API}/api/v1/users/${userId}/follow`, {
        method,
        headers: authHeaders(),
      });
      if (res.ok) {
        setSiguiendo(!siguiendo);
        setUsuario((prev: any) => ({
          ...prev,
          numSeguidores: siguiendo ? prev.numSeguidores - 1 : prev.numSeguidores + 1,
        }));
        toast.success(siguiendo ? `Dejaste de seguir a ${usuario.nombre}` : `Ahora sigues a ${usuario.nombre}`);
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
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#13ec80" }} />
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="text-center py-12">
        <p className="text-sm mb-4" style={{ color: "#94a3b8" }}>Usuario no encontrado</p>
        <button
          onClick={() => router.push("/app/feed")}
          className="px-4 h-10 rounded-xl text-sm font-semibold"
          style={{ backgroundColor: "#13ec80", color: "#0a1628" }}
        >
          Volver al feed
        </button>
      </div>
    );
  }

  const deportesNivel = usuario.deportesNivel ?? [];

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header del perfil */}
      <div
        className="rounded-2xl p-6 mb-5"
        style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <img
            src={usuario.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${usuario.nombre}`}
            alt={usuario.nombre}
            className="w-24 h-24 rounded-full object-cover flex-shrink-0"
            style={{ border: "3px solid rgba(19,236,128,0.4)" }}
          />

          <div className="flex-1 min-w-0">
            {/* Nombre + botones */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
              <div>
                <h1 className="text-2xl font-black" style={{ color: "#f1f5f9" }}>{usuario.nombre}</h1>
                <p className="text-sm" style={{ color: "#94a3b8" }}>@{usuario.alias}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleToggleSeguir}
                  disabled={loadingFollow}
                  className="flex items-center justify-center gap-2 px-4 h-9 rounded-xl text-sm font-bold transition-all disabled:opacity-70"
                  style={siguiendo ? {
                    backgroundColor: "rgba(255,255,255,0.06)",
                    color: "#94a3b8",
                    border: "1px solid rgba(255,255,255,0.1)",
                  } : {
                    backgroundColor: "#13ec80",
                    color: "#0a1628",
                  }}
                >
                  {loadingFollow
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : siguiendo ? "Siguiendo" : "Seguir"
                  }
                </button>
                <button
                  onClick={() => router.push("/app/messages")}
                  className="flex items-center gap-1.5 px-4 h-9 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.06)",
                    color: "#94a3b8",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Mensaje
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-wrap items-center gap-3 text-xs mb-3" style={{ color: "#94a3b8" }}>
              {usuario.zona && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" style={{ color: "#13ec80" }} />
                  <span>{usuario.zona}</span>
                </div>
              )}
              {usuario.edad && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" style={{ color: "#13ec80" }} />
                  <span>{usuario.edad} años</span>
                </div>
              )}
            </div>

            {usuario.bio && (
              <p className="text-sm mb-4 leading-relaxed" style={{ color: "#e2e8f0" }}>{usuario.bio}</p>
            )}

            {/* Contadores */}
            <div className="flex gap-5">
              <div>
                <span className="font-black text-lg" style={{ color: "#f1f5f9" }}>{usuario.numSeguidores ?? 0}</span>
                <span className="text-xs ml-1" style={{ color: "#94a3b8" }}>Seguidores</span>
              </div>
              <div>
                <span className="font-black text-lg" style={{ color: "#f1f5f9" }}>{usuario.numSiguiendo ?? 0}</span>
                <span className="text-xs ml-1" style={{ color: "#94a3b8" }}>Siguiendo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Deportes */}
        {deportesNivel.length > 0 && (
          <div
            className="flex flex-wrap gap-2 mt-5 pt-5"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            {deportesNivel.map((d: any) => (
              <span
                key={d.deporte}
                className="px-3 py-1 text-xs font-semibold rounded-full"
                style={{
                  backgroundColor: "rgba(19,236,128,0.1)",
                  color: "#13ec80",
                  border: "1px solid rgba(19,236,128,0.25)",
                }}
              >
                ⚡ {d.deporte} · Nv.{d.nivel}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Publicaciones */}
      <div>
        <h2 className="text-lg font-black mb-4" style={{ color: "#f1f5f9" }}>
          Publicaciones
        </h2>

        {loadingPosts ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl h-40 animate-pulse"
                style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
              />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PublicationCard key={post._id?.toString() ?? post.id} publicacion={post} />
            ))}
          </div>
        ) : (
          <div
            className="rounded-2xl p-12 text-center"
            style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="text-sm" style={{ color: "#94a3b8" }}>
              Este usuario aún no ha creado ninguna publicación
            </p>
          </div>
        )}
      </div>
    </div>
  );
}