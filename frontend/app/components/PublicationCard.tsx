"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, MapPin, MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface PublicationCardProps {
  publicacion: any;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export const PublicationCard = ({ publicacion }: PublicationCardProps) => {
  const autor = publicacion.autor ?? {};
  const nombre = autor.nombre ?? publicacion.usuarioNombre ?? "Usuario";
  const alias = autor.alias ?? publicacion.usuarioAlias ?? "";
  const avatar =
    autor.avatar ||
    publicacion.usuarioAvatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${nombre}`;
  const autorId = autor._id ?? autor.id ?? publicacion.usuarioId ?? "";
  const fecha = publicacion.createdAt ?? publicacion.fecha;
  const postId = publicacion._id ?? publicacion.id;

  const initialHasLiked: boolean = publicacion.hasLiked ?? false;
  const initialLikes: number =
    publicacion.numLikes ?? publicacion.likes?.length ?? publicacion.likes ?? 0;

  const [liked, setLiked] = useState<boolean>(initialHasLiked);
  const [likes, setLikes] = useState<number>(initialLikes);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = selectedImage ? "hidden" : "auto";
  }, [selectedImage]);

  const handleLike = async () => {
    if (!postId) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikes((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      const res = await fetch(`${API}/api/v1/posts/${postId}/like`, {
        method: wasLiked ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setLiked(wasLiked);
        setLikes((prev) => (wasLiked ? prev + 1 : prev - 1));
      }
    } catch {
      setLiked(wasLiked);
      setLikes((prev) => (wasLiked ? prev + 1 : prev - 1));
    }
  };

  const timeAgo = fecha
    ? formatDistanceToNow(new Date(fecha), { addSuffix: true, locale: es })
    : "";

  const goProfile = () => {
    if (autorId) router.push(`/app/profile/${autorId}`);
  };

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden transition-all"
        style={{
          backgroundColor: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Header */}
        <div className="p-4 pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <img
                src={avatar}
                alt={nombre}
                className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                style={{ border: "2px solid rgba(19,236,128,0.4)" }}
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="font-bold text-sm cursor-pointer hover:underline"
                    style={{ color: "#f1f5f9" }}
                    onClick={goProfile}
                  >
                    {nombre}
                  </span>
                  {alias && (
                    <span className="text-xs" style={{ color: "#94a3b8" }}>
                      @{alias}
                    </span>
                  )}
                </div>
                {/* Deporte + zona */}
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {publicacion.deporte && (
                    <span
                      className="text-xs font-semibold flex items-center gap-1"
                      style={{ color: "#13ec80" }}
                    >
                      ⚡ {publicacion.deporte}
                    </span>
                  )}
                  {(publicacion.ubicacion ?? autor.zona) && (
                    <span className="text-xs flex items-center gap-0.5" style={{ color: "#94a3b8" }}>
                      <MapPin className="w-3 h-3" />
                      {publicacion.ubicacion ?? autor.zona}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Tiempo + menú */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>
                {timeAgo}
              </span>
              <button
                className="p-1 rounded-lg transition-colors"
                style={{ color: "#94a3b8" }}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Contenido */}
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "#e2e8f0" }}>
            {publicacion.contenido}
          </p>
        </div>

        {/* Imagen */}
        {publicacion.imagen && (
          <div className="mx-4 mb-3 rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
            <img
              src={publicacion.imagen}
              alt="Publicación"
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setSelectedImage(publicacion.imagen)}
            />
          </div>
        )}

        {/* Acciones */}
        <div
          className="px-4 py-3 flex items-center gap-5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 transition-colors"
            style={{ color: liked ? "#13ec80" : "#94a3b8" }}
          >
            <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
            <span className="text-sm font-medium">{likes}</span>
          </button>
        </div>
      </div>

      {/* Modal imagen */}
      {selectedImage && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white text-3xl font-bold"
          >
            ✕
          </button>
          <img
            src={selectedImage}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};