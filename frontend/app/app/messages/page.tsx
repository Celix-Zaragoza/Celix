"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mockConversaciones, mockMensajes } from "../../data/mockData";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Search, Send, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "../../context/AuthContext";

export default function Page() {
  const router = useRouter();
  const { user } = useAuth();

  const conversationId: string | undefined = undefined;

  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [conversaciones] = useState(mockConversaciones);

  const conversacionActual = conversaciones.find((c) => c.id === conversationId);
  const mensajes = conversationId ? mockMensajes[conversationId] || [] : [];

  const filteredConversaciones = searchQuery
    ? conversaciones.filter(
        (c) =>
          c.participantes[0].nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.participantes[0].alias.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversaciones;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setMessageText("");
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-12rem)]">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex">
        {/* Conversations List */}
        <div className="w-full md:w-96 border-r flex-shrink-0 flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Mensajes</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar conversaciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversaciones.map((conversacion) => {
              const participante = conversacion.participantes[0];
              const timeAgo = formatDistanceToNow(new Date(conversacion.ultimaFecha), {
                addSuffix: true,
                locale: es,
              });

              return (
                <button
                  key={conversacion.id}
                  onClick={() => router.push(`/app/messages/${conversacion.id}`)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b`}
                >
                  <div className="relative">
                    <img
                      src={participante.avatar}
                      alt={participante.nombre}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    {conversacion.noLeidos > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                        {conversacion.noLeidos}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-gray-900 truncate">{participante.nombre}</h3>
                      <span className="text-xs text-gray-500 flex-shrink-0">{timeAgo}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conversacion.ultimoMensaje}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right empty state (desktop) */}
        {!conversacionActual && (
          <div className="hidden md:flex flex-1 items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">Selecciona una conversación</p>
              <p className="text-sm">Elige un contacto para comenzar a chatear</p>
            </div>
          </div>
        )}

        {/* (No chat area on /app/messages) */}
        {!!conversacionActual && (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push("/app/messages")} className="md:hidden">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {mensajes.map((mensaje) => {
                const isOwn = mensaje.remitenteId === user?.id || mensaje.remitenteId === "1";
                const timeAgo = formatDistanceToNow(new Date(mensaje.fecha), {
                  addSuffix: true,
                  locale: es,
                });

                return (
                  <div key={mensaje.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] ${isOwn ? "order-1" : "order-2"}`}>
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isOwn ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p>{mensaje.contenido}</p>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 block">{timeAgo}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={!messageText.trim()}>
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}