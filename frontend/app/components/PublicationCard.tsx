"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, MapPin, MoreVertical } from "lucide-react";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface PublicationCardProps {
  publicacion: any;
}

const API = "http://localhost:3001/api/v1";

export const PublicationCard = ({ publicacion }: PublicationCardProps) => {
  const autor = publicacion.autor ?? {};
  const nombre = autor.nombre ?? publicacion.usuarioNombre ?? "Usuario";
  const alias = autor.alias ?? publicacion.usuarioAlias ?? "";
  const avatar =
    autor.avatar ??
    publicacion.usuarioAvatar ??
    `https://api.dicebear.com/7.x/initials/svg?seed=${nombre}`;
  const autorId = autor._id ?? autor.id ?? publicacion.usuarioId ?? "";
  const fecha = publicacion.createdAt ?? publicacion.fecha;
  const postId = publicacion._id ?? publicacion.id;

  // La API devuelve hasLiked y numLikes directamente
  // Si viene del mock (likes es array sin hasLiked), usamos valores por defecto
  const initialHasLiked: boolean = publicacion.hasLiked ?? false;
  const initialLikes: number =
    publicacion.numLikes ?? publicacion.likes?.length ?? publicacion.likes ?? 0;

  const [liked, setLiked] = useState<boolean>(initialHasLiked);
  const [likes, setLikes] = useState<number>(initialLikes);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [selectedImage]);

  const handleLike = async () => {
    if (!postId) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikes((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      const res = await fetch(`${API}/posts/${postId}/like`, {
        method: wasLiked ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        // Revertir si falla
        setLiked(wasLiked);
        setLikes((prev) => (wasLiked ? prev + 1 : prev - 1));
      }
    } catch {
      // Revertir si hay error de red
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
    <div className="bg-[#1e293b] rounded-xl shadow-sm border border-[rgba(148,163,184,0.2)] overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <img
              src={avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${nombre}`}
              alt={nombre}
              className="w-14 h-14 rounded-full object-cover border-4 border-[#13ec80]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3
                  className="font-bold text-[#f1f5f9] cursor-pointer hover:underline"
                  onClick={goProfile}
                >
                  {nombre}
                </h3>
                <span className="px-2 py-0.5 bg-[#13ec80] text-[#102219] text-xs font-medium rounded-full">
                  {publicacion.deporte}
                </span>
              </div>
              {alias && <p className="text-sm text-[#94a3b8]">@{alias}</p>}
              <div className="flex items-center gap-1 text-xs text-[#94a3b8] mt-1">
                {publicacion.ubicacion && (
                  <>
                    <MapPin className="w-3 h-3" />
                    <span>{publicacion.ubicacion}</span>
                    <span>•</span>
                  </>
                )}
                <span>{timeAgo}</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#94a3b8] hover:text-[#f1f5f9]"
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>

        {/* Contenido */}
        <p className="text-[#f1f5f9] mb-3 leading-relaxed">
          {publicacion.contenido}
        </p>
      </div>

      {/* Imagen */}
      {publicacion.imagen && (
        <div className="w-full aspect-video bg-[#0f172a]">
          <img
            src={publicacion.imagen}
            alt="Publicación"
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setSelectedImage(publicacion.imagen)}
          />
        </div>
      )}

      {/* Acciones */}
      <div className="p-4 border-t border-[rgba(148,163,184,0.2)]">
        <div className="flex items-center gap-6">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors ${
              liked
                ? "text-[#13ec80]"
                : "text-[#94a3b8] hover:text-[#13ec80]"
            }`}
          >
            <Heart className={`w-6 h-6 ${liked ? "fill-current" : ""}`} />
            <span className="font-medium">{likes}</span>
          </button>
        </div>
      </div>
      {selectedImage && (
      <div
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
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
          className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    )}
    </div>
    
  );
};
