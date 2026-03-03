"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Publicacion } from "../data/mockData";
import { Heart, MessageCircle, Share2, MapPin, MoreVertical } from "lucide-react";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface PublicationCardProps {
  publicacion: Publicacion;
}

export const PublicationCard = ({ publicacion }: PublicationCardProps) => {
  const [liked, setLiked] = useState(publicacion.hasLiked || false);
  const [likes, setLikes] = useState(publicacion.likes);
  const router = useRouter();

  const handleLike = () => {
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
    setLiked((prev) => !prev);
  };

  const timeAgo = formatDistanceToNow(new Date(publicacion.fecha), {
    addSuffix: true,
    locale: es,
  });

  const goProfile = () => router.push(`/app/profile/${publicacion.usuarioId}`);

  return (
    <div className="bg-[#1e293b] rounded-xl shadow-sm border border-[rgba(148,163,184,0.2)] overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <img
              src={publicacion.usuarioAvatar}
              alt={publicacion.usuarioNombre}
              className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
              onClick={goProfile}
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#f1f5f9] cursor-pointer hover:underline" onClick={goProfile}>
                  {publicacion.usuarioNombre}
                </h3>
                <span className="px-2 py-0.5 bg-[#13ec80] text-[#102219] text-xs font-medium rounded-full">
                  {publicacion.deporte}
                </span>
              </div>
              <p className="text-sm text-[#94a3b8]">@{publicacion.usuarioAlias}</p>
              <div className="flex items-center gap-1 text-xs text-[#94a3b8] mt-1">
                <MapPin className="w-3 h-3" />
                <span>{publicacion.ubicacion}</span>
                <span>•</span>
                <span>{timeAgo}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-[#94a3b8] hover:text-[#f1f5f9]">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <p className="text-[#f1f5f9] mb-3 leading-relaxed">{publicacion.contenido}</p>
      </div>

      {/* Image */}
      {publicacion.imagen && (
        <div className="w-full aspect-video bg-gray-100">
          <img src={publicacion.imagen} alt="Publicación" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Actions */}
      <div className="p-4 border-t border-[rgba(148,163,184,0.2)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 transition-colors ${
                liked ? "text-[#13ec80]" : "text-[#94a3b8] hover:text-[#13ec80]"
              }`}
            >
              <Heart className={`w-6 h-6 ${liked ? "fill-current" : ""}`} />
              <span className="font-medium">{likes}</span>
            </button>

            <button className="flex items-center gap-2 text-[#94a3b8] hover:text-[#13ec80] transition-colors">
              <MessageCircle className="w-6 h-6" />
              <span className="font-medium">{publicacion.comentarios}</span>
            </button>

            <button className="flex items-center gap-2 text-[#94a3b8] hover:text-[#13ec80] transition-colors">
              <Share2 className="w-6 h-6" />
              <span className="font-medium">{publicacion.compartidos}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};