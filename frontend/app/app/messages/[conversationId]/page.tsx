/**
 * Archivo: frontend/app/app/messages/[conversationId]/page.tsx
 * Descripción: Página de conversación individual para enviar y recibir mensajes.
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Search, Send, ArrowLeft, Plus, X, MessageCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "../../../context/AuthContext";
import { getSocket, disconnectSocket } from "../../../../lib/socket";

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

/**
 * Devuelve el participante opuesto en una conversación.
 */
function getOtherParticipant(conv: Conversacion, myId: string): Participante {
  return conv.participantes.find((p) => p.id !== myId) ?? conv.participantes[0];
}

/**
 * Componente de página de /app/messages/[conversationId] para mostrar la conversación actual.
 */
export default function Page() {
  const router = useRouter();
  const params = useParams<{ conversationId: string }>();
  const conversationId = params?.conversationId;
  const { user } = useAuth();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingMensajes, setLoadingMensajes] = useState(false);

  const [showNewChat, setShowNewChat] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<UsuarioBusqueda[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  const conversacionActual = conversaciones.find((c) => c.id === conversationId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  /**
   * Obtiene la lista de conversaciones disponibles para el usuario.
   */
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
            id: p.id, nombre: p.nombre, alias: p.alias, avatar: p.avatar,
          })),
          ultimoMensaje: c.ultimoMensaje ?? "",
          ultimaFecha: c.ultimaFecha ?? c.updatedAt,
          noLeidos: c.noLeidos?.[user?.id ?? ""] ?? 0,
        }));
        setConversaciones(mapped);
      }
    } catch (err) { console.error(err); }
  }, [token, API, user?.id]);

  useEffect(() => { fetchConversaciones(); }, [fetchConversaciones]);

  useEffect(() => {
    if (!conversationId || !token) return;
    setLoadingMensajes(true);
    fetch(`${API}/api/v1/conversations/${conversationId}/messages`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          const mapped: Mensaje[] = [...data.messages].reverse().map((m: any) => ({
            id: m.id,
            conversacion: conversationId,
            remitente: { id: m.remitente?.id ?? m.remitente, nombre: m.remitente?.nombre ?? "", alias: m.remitente?.alias ?? "", avatar: m.remitente?.avatar },
            contenido: m.contenido,
            createdAt: m.createdAt,
          }));
          setMensajes(mapped);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingMensajes(false));
  }, [conversationId, token, API]);

  useEffect(() => {
    if (!token || !user) return;
    const socket = getSocket();
    socket.connect();
    socket.on("message:new", (msg: Mensaje) => setMensajes((prev) => [...prev, msg]));
    socket.on("conversation:updated", ({ conversationId: convId, ultimoMensaje, ultimaFecha, noLeidos }) => {
      setConversaciones((prev) => prev.map((c) => c.id === convId ? { ...c, ultimoMensaje, ultimaFecha, noLeidos } : c));
    });
    return () => { socket.off("message:new"); socket.off("conversation:updated"); disconnectSocket(); };
  }, [token, user]);

  useEffect(() => {
    if (!token || !conversationId) return;
    const socket = getSocket();
    socket.emit("join:conversation", conversationId);
    socket.emit("conversation:read", conversationId);
    setConversaciones((prev) => prev.map((c) => c.id === conversationId ? { ...c, noLeidos: 0 } : c));
    return () => { socket.emit("leave:conversation", conversationId); };
  }, [conversationId, token]);

  /**
   * Envía un mensaje a la conversación activa a través del socket.
   */
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !conversationId || !token) return;
    const socket = getSocket();
    socket.emit("message:send", { conversationId, contenido: messageText.trim() });
    setMessageText("");
  };

  useEffect(() => {
    if (!userSearch.trim() || !token) { setUserResults([]); return; }
    /**
     * Busca usuarios por texto para iniciar una nueva conversación.
     */
    const timer = setTimeout(async () => {
      setSearchingUsers(true);
      try {
        const res = await fetch(`${API}/api/v1/users/search?q=${encodeURIComponent(userSearch)}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (data.ok) setUserResults(data.users ?? []);
      } catch (err) { console.error(err); }
      finally { setSearchingUsers(false); }
    }, 400);
    return () => clearTimeout(timer);
  }, [userSearch, token, API]);

  /**
   * Inicia una nueva conversación con el usuario seleccionado.
   */
  const handleStartConversation = async (userId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/v1/conversations`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" },
        body: JSON.stringify({ participanteId: userId }),
      });
      const data = await res.json();
      if (data.ok) {
        setShowNewChat(false);
        setUserSearch("");
        await fetchConversaciones();
        router.push(`/app/messages/${data.conversation.id}`);
      }
    } catch (err) { console.error(err); }
  };

  const filteredConversaciones = searchQuery
    ? conversaciones.filter((c) => {
        const other = getOtherParticipant(c, user?.id ?? "");
        return other.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || other.alias.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : conversaciones;

  const inputStyle: React.CSSProperties = {
    backgroundColor: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#f1f5f9",
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-12rem)]">
      <div className="rounded-2xl overflow-hidden h-full flex" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>

        {/* ── Lista de conversaciones ── */}
        <div
          className={`w-full md:w-96 flex-shrink-0 flex flex-col ${conversationId ? "hidden md:flex" : "flex"}`}
          style={{ borderRight: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black" style={{ color: "#f1f5f9" }}>Mensajes</h2>
              <button
                onClick={() => setShowNewChat(true)}
                className="flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs font-semibold transition-all"
                style={{ backgroundColor: "rgba(19,236,128,0.12)", color: "#13ec80", border: "1px solid rgba(19,236,128,0.25)" }}
              >
                <Plus className="w-3.5 h-3.5" />Nuevo
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#13ec80" }} />
              <input
                type="text"
                placeholder="Buscar conversaciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#13ec80")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversaciones.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <MessageCircle className="w-10 h-10 mb-3" style={{ color: "rgba(148,163,184,0.3)" }} />
                <p className="text-sm" style={{ color: "#94a3b8" }}>No hay conversaciones todavía</p>
              </div>
            )}
            {filteredConversaciones.map((conv) => {
              const other = getOtherParticipant(conv, user?.id ?? "");
              const timeAgo = conv.ultimaFecha
                ? formatDistanceToNow(new Date(conv.ultimaFecha), { addSuffix: true, locale: es })
                : "";
              const isActive = conv.id === conversationId;

              return (
                <button
                  key={conv.id}
                  onClick={() => router.push(`/app/messages/${conv.id}`)}
                  className="w-full p-4 flex items-start gap-3 transition-all"
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    backgroundColor: isActive ? "rgba(19,236,128,0.06)" : "transparent",
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={other.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${other.nombre}`}
                      alt={other.nombre}
                      className="w-11 h-11 rounded-full object-cover"
                      style={{ border: `2px solid ${isActive ? "rgba(19,236,128,0.6)" : "rgba(19,236,128,0.3)"}` }}
                    />
                    {conv.noLeidos > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "#13ec80", color: "#0a1628" }}>
                        {conv.noLeidos}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="font-semibold text-sm truncate" style={{ color: "#f1f5f9" }}>{other.nombre}</h3>
                      <span className="text-xs flex-shrink-0 ml-2" style={{ color: "rgba(148,163,184,0.5)" }}>{timeAgo}</span>
                    </div>
                    <p className="text-xs truncate" style={{ color: "#94a3b8" }}>{conv.ultimoMensaje || "Sin mensajes aún"}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Área de chat ── */}
        {conversacionActual ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header chat */}
            <div className="p-4 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <button
                onClick={() => router.push("/app/messages")}
                className="md:hidden w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#94a3b8" }}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              {(() => {
                const other = getOtherParticipant(conversacionActual, user?.id ?? "");
                return (
                  <>
                    <img
                      src={other.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${other.nombre}`}
                      alt={other.nombre}
                      className="w-10 h-10 rounded-full object-cover"
                      style={{ border: "2px solid rgba(19,236,128,0.4)" }}
                    />
                    <div>
                      <p className="font-bold text-sm" style={{ color: "#f1f5f9" }}>{other.nombre}</p>
                      <p className="text-xs" style={{ color: "#94a3b8" }}>@{other.alias}</p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {loadingMensajes && (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#13ec80" }} />
                </div>
              )}
              {mensajes.map((msg) => {
                const isOwn = msg.remitente.id === user?.id;
                const timeAgo = formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: es });
                return (
                  <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div className="max-w-[70%]">
                      <div
                        className="rounded-2xl px-4 py-2.5 text-sm"
                        style={{
                          backgroundColor: isOwn ? "#13ec80" : "rgba(255,255,255,0.08)",
                          color: isOwn ? "#0a1628" : "#f1f5f9",
                        }}
                      >
                        {msg.contenido}
                      </div>
                      <span className="text-xs mt-1 block px-1" style={{ color: "rgba(148,163,184,0.5)", textAlign: isOwn ? "right" : "left" }}>
                        {timeAgo}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input mensaje */}
            <form onSubmit={handleSendMessage} className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 h-11 px-4 rounded-xl text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#13ec80")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                  style={{ backgroundColor: "#13ec80", color: "#0a1628" }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-14 h-14 mx-auto mb-4" style={{ color: "rgba(148,163,184,0.15)" }} />
              <p className="font-semibold mb-1" style={{ color: "#f1f5f9" }}>Selecciona una conversación</p>
              <p className="text-sm" style={{ color: "#94a3b8" }}>o inicia una nueva con el botón Nuevo</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal nueva conversación ── */}
      {showNewChat && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={() => { setShowNewChat(false); setUserSearch(""); setUserResults([]); }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{ backgroundColor: "#0f2318", border: "1px solid rgba(255,255,255,0.1)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black" style={{ color: "#f1f5f9" }}>Nueva conversación</h3>
              <button
                onClick={() => { setShowNewChat(false); setUserSearch(""); setUserResults([]); }}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#94a3b8" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#13ec80" }} />
              <input
                type="text"
                placeholder="Buscar usuario por nombre o alias..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                autoFocus
                className="w-full h-11 pl-10 pr-4 rounded-xl text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#13ec80")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1">
              {searchingUsers && (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#13ec80" }} />
                </div>
              )}
              {!searchingUsers && userSearch && userResults.length === 0 && (
                <p className="text-center text-sm py-6" style={{ color: "#94a3b8" }}>No se encontraron usuarios</p>
              )}
              {userResults.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleStartConversation(u.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
                  style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(19,236,128,0.08)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)")}
                >
                  <img
                    src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.nombre}`}
                    alt={u.nombre}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    style={{ border: "2px solid rgba(19,236,128,0.3)" }}
                  />
                  <div className="text-left">
                    <p className="font-semibold text-sm" style={{ color: "#f1f5f9" }}>{u.nombre}</p>
                    <p className="text-xs" style={{ color: "#94a3b8" }}>@{u.alias}</p>
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