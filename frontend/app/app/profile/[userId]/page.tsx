"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockUsuarios, mockPublicaciones } from "../../../data/mockData";
import { Button } from "../../../components/ui/button";
import { PublicationCard } from "../../../components/PublicationCard";
import { MapPin, Calendar, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export default function Page() {
  const router = useRouter();
  const params = useParams<{ userId: string }>();
  const userId = params?.userId;

  const [isSiguiendo, setIsSiguiendo] = useState(false);

  const usuario = mockUsuarios.find((u) => String(u.id) === String(userId));
  const publicacionesUsuario = mockPublicaciones.filter((p) => String(p.usuarioId) === String(userId));

  if (!usuario) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Usuario no encontrado</p>
        <Button onClick={() => router.push("/app/feed")} className="mt-4">
          Volver al feed
        </Button>
      </div>
    );
  }

  const handleToggleSeguir = () => {
    setIsSiguiendo(Math.random() > 0.5);
    toast.success(isSiguiendo ? "Dejaste de seguir" : "Ahora sigues a " + usuario.nombre);
  };

  const handleMessage = () => {
    router.push("/app/messages");
    toast.info("Función de mensajería próximamente");
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <img
            src={usuario.avatar}
            alt={usuario.nombre}
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
          />
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{usuario.nombre}</h1>
                <p className="text-gray-600">@{usuario.alias}</p>
              </div>
              <div className="flex gap-2 mt-3 md:mt-0">
                <Button
                  onClick={handleToggleSeguir}
                  variant={isSiguiendo ? "outline" : "default"}
                  className={isSiguiendo ? "border-2 border-gray-300" : ""}
                >
                  {isSiguiendo ? "Siguiendo" : "Seguir"}
                </Button>
                <Button onClick={handleMessage} variant="outline">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Mensaje
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{usuario.zona}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{usuario.edad} años</span>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{usuario.bio}</p>

            <div className="flex gap-6">
              <div className="text-center">
                <span className="font-bold text-gray-900">{usuario.seguidores}</span>
                <span className="text-gray-600 ml-1">Seguidores</span>
              </div>
              <div className="text-center">
                <span className="font-bold text-gray-900">{usuario.siguiendo}</span>
                <span className="text-gray-600 ml-1">Siguiendo</span>
              </div>
              <div className="text-center">
                <span className="font-bold text-gray-900">{usuario.publicaciones}</span>
                <span className="text-gray-600 ml-1">Publicaciones</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sports Tags */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-100">
          {usuario.deportes.map((deporte: string) => (
            <span key={deporte} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              {deporte}
            </span>
          ))}
          <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
            Nivel: {usuario.nivelGeneral}%
          </span>
        </div>
      </div>

      {/* Publications */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Publicaciones</h2>
        {publicacionesUsuario.length > 0 ? (
          <div className="space-y-4">
            {publicacionesUsuario.map((publicacion) => (
              <PublicationCard key={publicacion.id} publicacion={publicacion} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500">Este usuario aún no ha creado publicaciones</p>
          </div>
        )}
      </div>
    </div>
  );
}