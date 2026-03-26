"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Search, Send, ArrowLeft, Plus, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "../../../context/AuthContext";
import { getSocket, disconnectSocket } from "../../../../lib/socket";

// ── Tipos ────────────────────────────────────────────────────────────────────

interface Participante {
  id: string;
  nombre: string;
  alias: string;
  avatar?: string;
}

interface Conversacion {
  id: string;
  participantes: Participante[];
  ultimoMensaje: string;
  ultimaFecha: string;
  noLeidos: number;
}

interface Mensaje {
  id: string;
  conversacion: string;
  remitente: Participante;
  contenido: string;
  createdAt: string;
}

interface UsuarioBusqueda {
  id: string;
  nombre: string;
  alias: string;
  avatar?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getOtherParticipant(conv: Conversacion, myId: string): Participante {
  return conv.participantes.find((p) => p.id !== myId) ?? conv.participantes[0];
}

// ── Componente ───────────────────────────────────────────────────────────────

export default function Page() {
  const router = useRouter();
  const params = useParams<{ conversationId: string }>();
  const conversationId = params?.conversationId;
  const { user } = useAuth();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Estado principal
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingMensajes, setLoadingMensajes] = useState(false);

  // Modal nueva conversación
  const [showNewChat, setShowNewChat] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<UsuarioBusqueda[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  const conversacionActual = conversaciones.find((c) => c.id === conversationId);

  // ── Scroll al último mensaje ─────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  // ── Cargar conversaciones ────────────────────────────────────────────────
  const fetchConversaciones = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/v1/conversations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.ok) {
        const mapped: Conversacion[] = data.conversations.map((c: any) => ({
          id: c.id,
          participantes: c.participantes.map((p: any) => ({
            id: p.id,
            nombre: p.nombre,
            alias: p.alias,
            avatar: p.avatar,
          })),
          ultimoMensaje: c.ultimoMensaje ?? "",
          ultimaFecha: c.ultimaFecha ?? c.updatedAt,
          noLeidos: c.noLeidos?.[user?.id ?? ""] ?? 0,
        }));
        setConversaciones(mapped);
      }
    } catch (err) {
      console.error("Error cargando conversaciones:", err);
    }
  }, [token, API, user?.id]);

  useEffect(() => {
    fetchConversaciones();
  }, [fetchConversaciones]);

  // ── Cargar mensajes de la conversación activa ────────────────────────────
  useEffect(() => {
    if (!conversationId || !token) return;
    setLoadingMensajes(true);

    fetch(`${API}/api/v1/conversations/${conversationId}/messages`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          // La API devuelve los mensajes en orden descendente, los invertimos
          const mapped: Mensaje[] = [...data.messages].reverse().map((m: any) => ({
            id: m.id,
            conversacion: conversationId,
            remitente: {
              id: m.remitente?.id ?? m.remitente,
              nombre: m.remitente?.nombre ?? "",
              alias: m.remitente?.alias ?? "",
              avatar: m.remitente?.avatar,
            },
            contenido: m.contenido,
            createdAt: m.createdAt,
          }));
          setMensajes(mapped);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingMensajes(false));
  }, [conversationId, token, API]);

  // ── Socket.io ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token || !user) return;

    const socket = getSocket();
    socket.connect();

    // Nuevo mensaje en la conversación abierta
    socket.on("message:new", (msg: Mensaje) => {
      setMensajes((prev) => [...prev, msg]);
    });

    // Actualización de badge en la lista (mensaje en otra conversación)
    socket.on("conversation:updated", ({ conversationId: convId, ultimoMensaje, ultimaFecha, noLeidos }) => {
      setConversaciones((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, ultimoMensaje, ultimaFecha, noLeidos }
            : c
        )
      );
    });

    return () => {
      socket.off("message:new");
      socket.off("conversation:updated");
      disconnectSocket();
    };
  }, [token, user]);

  // ── Unirse/salir de sala de conversación ────────────────────────────────
  useEffect(() => {
    if (!token || !conversationId) return;
    const socket = getSocket();

    socket.emit("join:conversation", conversationId);
    socket.emit("conversation:read", conversationId);

    // Poner a 0 los no leídos localmente
    setConversaciones((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, noLeidos: 0 } : c))
    );

    return () => {
      socket.emit("leave:conversation", conversationId);
    };
  }, [conversationId, token]);

  // ── Enviar mensaje ───────────────────────────────────────────────────────
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !conversationId || !token) return;

    const socket = getSocket();
    socket.emit("message:send", {
      conversationId,
      contenido: messageText.trim(),
    });

    setMessageText("");
  };

  // ── Buscar usuarios para nueva conversación ──────────────────────────────
  useEffect(() => {
    if (!userSearch.trim() || !token) {
      setUserResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchingUsers(true);
      try {
        const res = await fetch(
          `${API}/api/v1/users/search?q=${encodeURIComponent(userSearch)}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        const data = await res.json();
        if (data.ok) setUserResults(data.users ?? []);
      } catch (err) {
        console.error("Error buscando usuarios:", err);
      } finally {
        setSearchingUsers(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [userSearch, token, API]);

  // ── Iniciar o abrir conversación con un usuario ──────────────────────────
  const handleStartConversation = async (userId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/v1/conversations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ participanteId: userId }),
      });
      const data = await res.json();
      if (data.ok) {
        setShowNewChat(false);
        setUserSearch("");
        await fetchConversaciones();
        router.push(`/app/messages/${data.conversation.id}`);
      }
    } catch (err) {
      console.error("Error creando conversación:", err);
    }
  };

  // ── Filtro de la lista de conversaciones ─────────────────────────────────
  const filteredConversaciones = searchQuery
    ? conversaciones.filter((c) => {
        const other = getOtherParticipant(c, user?.id ?? "");
        return (
          other.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          other.alias.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    : conversaciones;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-12rem)]">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex">

        {/* ── Lista de conversaciones ── */}
        <div className={`w-full md:w-96 border-r flex-shrink-0 flex flex-col ${conversationId ? "hidden md:flex" : "flex"}`}>
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Mensajes</h2>
              <Button
                size="sm"
                onClick={() => setShowNewChat(true)}
                className="flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Nuevo
              </Button>
            </div>
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
            {filteredConversaciones.length === 0 && (
              <p className="text-center text-gray-400 text-sm mt-8">No hay conversaciones</p>
            )}
            {filteredConversaciones.map((conv) => {
              const other = getOtherParticipant(conv, user?.id ?? "");
              const timeAgo = conv.ultimaFecha
                ? formatDistanceToNow(new Date(conv.ultimaFecha), { addSuffix: true, locale: es })
                : "";

              return (
                <button
                  key={conv.id}
                  onClick={() => router.push(`/app/messages/${conv.id}`)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b ${
                    conv.id === conversationId ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="relative">
                    <img
                      src={other.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${other.nombre}`}
                      alt={other.nombre}
                      className="w-14 h-14 rounded-full object-cover border-4 border-[#13ec80]/30"
                    />
                    {conv.noLeidos > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                        {conv.noLeidos}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-gray-900 truncate">{other.nombre}</h3>
                      <span className="text-xs text-gray-500 flex-shrink-0">{timeAgo}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conv.ultimoMensaje}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Área de chat ── */}
        {conversacionActual ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-3">
              <button onClick={() => router.push("/app/messages")} className="md:hidden">
                <ArrowLeft className="w-5 h-5" />
              </button>
              {(() => {
                const other = getOtherParticipant(conversacionActual, user?.id ?? "");
                return (
                  <>
                    <img
                      src={other.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${other.nombre}`}
                      alt={other.nombre}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-bold text-gray-900">{other.nombre}</p>
                      <p className="text-sm text-gray-500">@{other.alias}</p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {loadingMensajes && (
                <p className="text-center text-gray-400 text-sm">Cargando mensajes...</p>
              )}
              {mensajes.map((msg) => {
                const isOwn = msg.remitente.id === user?.id;
                const timeAgo = formatDistanceToNow(new Date(msg.createdAt), {
                  addSuffix: true,
                  locale: es,
                });
                return (
                  <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div className="max-w-[70%]">
                      <div className={`rounded-2xl px-4 py-2 ${isOwn ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"}`}>
                        <p>{msg.contenido}</p>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 block">{timeAgo}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
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
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">Selecciona una conversación</p>
              <p className="text-sm">o inicia una nueva con el botón Nuevo</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal nueva conversación ── */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Nueva conversación</h3>
              <button onClick={() => { setShowNewChat(false); setUserSearch(""); setUserResults([]); }}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar usuario por nombre o alias..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>

            <div className="max-h-64 overflow-y-auto">
              {searchingUsers && (
                <p className="text-center text-gray-400 text-sm py-4">Buscando...</p>
              )}
              {!searchingUsers && userSearch && userResults.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">No se encontraron usuarios</p>
              )}
              {userResults.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleStartConversation(u.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                <img
                  src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.nombre}`}
                  alt={u.nombre}
                  className="w-10 h-10 rounded-full object-cover"
                />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{u.nombre}</p>
                    <p className="text-sm text-gray-500">@{u.alias}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}