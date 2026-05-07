"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { PublicationCard } from "../../components/PublicationCard";
import { Button } from "../../components/ui/button";
import { Loader2, PlusCircle, Sparkles } from "lucide-react"; // Añadido Sparkles para el toque IA

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

export default function Page() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("para-ti");

  // Estados para los dos feeds
  const [paraTiPosts, setParaTiPosts] = useState<any[]>([]);
  const [followingPosts, setFollowingPosts] = useState<any[]>([]);
  
  const [loadingParaTi, setLoadingParaTi] = useState(true);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

  // 1. Cargar feed "Para ti" (IA)
  // Lo ejecutamos al montar el componente o cuando se selecciona la pestaña
  useEffect(() => {
    if (activeTab !== "para-ti") return;
    
    const fetchParaTi = async () => {
      setLoadingParaTi(true);
      try {
        const res = await fetch(`${API}/api/v1/posts/para-ti?limit=15`, { headers: authHeaders() });
        const data = await res.json();

        if (res.ok) {
          console.log(`Frontend] Recibidos ${data.posts?.length} posts ordenados por IA`); // LOG
          setParaTiPosts(data.posts ?? []);
        } else {
          console.error("[Frontend] Error en la respuesta:", data.message); // LOG
        }
      } catch (err) {
        console.error("Error en feed IA:", err);
      } finally {
        setLoadingParaTi(false);
      }
    };

    fetchParaTi();
  }, [activeTab]);

  // 2. Cargar feed de siguiendo
  useEffect(() => {
    if (activeTab !== "siguiendo") return;
    
    const fetchFollowing = async () => {
      setLoadingFollowing(true);
      try {
        const res = await fetch(`${API}/api/v1/posts/following?limit=15`, { headers: authHeaders() });
        if (res.ok) {
          const data = await res.json();
          setFollowingPosts(data.posts ?? []);
        }
      } catch (err) {
        console.error("Error en feed siguiendo:", err);
      } finally {
        setLoadingFollowing(false);
      }
    };
    fetchFollowing();
  }, [activeTab]);

  // Lógica de selección de datos
  const activePosts = activeTab === "siguiendo" ? followingPosts : paraTiPosts;
  const isLoading = activeTab === "siguiendo" ? loadingFollowing : loadingParaTi;

  return (
    <div className="max-w-4xl mx-auto">

      {/* Tabs */}
      <div className="flex items-center border-b mb-4" style={{ borderColor: "rgba(148,163,184,0.15)" }}>
        {["para-ti", "siguiendo"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-3 text-sm font-semibold transition-colors relative flex items-center justify-center gap-2"
            style={{ color: activeTab === tab ? "#f1f5f9" : "#94a3b8" }}
          >
            {tab === "para-ti" && <Sparkles className="w-3 h-3 text-[#13ec80]" />}
            {tab === "para-ti" ? "Para ti" : "Siguiendo"}
            {activeTab === tab && (
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full"
                style={{ width: "40%", backgroundColor: "#13ec80" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Botón subir post */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => router.push("/app/create-post")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95"
          style={{
            backgroundColor: "rgba(19,236,128,0.12)",
            color: "#13ec80",
            border: "1px solid rgba(19,236,128,0.25)",
          }}
        >
          <PlusCircle className="w-4 h-4" />
          Subir nuevo post
        </button>
      </div>

      {/* Contenido */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#13ec80" }} />
            {activeTab === "para-ti" && (
              <p className="text-sm animate-pulse" style={{ color: "#94a3b8" }}>
                Gemini está personalizando tu feed...
              </p>
            )}
          </div>
        ) : activePosts.length > 0 ? (
          activePosts.map((post) => (
            <PublicationCard key={post._id ?? post.id} publicacion={post} />
          ))
        ) : (
          <div
            className="rounded-xl p-12 text-center"
            style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(148,163,184,0.1)" }}
          >
            <p className="mb-4" style={{ color: "#94a3b8" }}>
              {activeTab === "siguiendo"
                ? "Aún no sigues a nadie o tus amigos están descansando hoy."
                : "No hemos encontrado posts que encajen con tus deportes. ¡Prueba a publicar algo!"}
            </p>
            <Button
              onClick={() => router.push(activeTab === "siguiendo" ? "/app/search" : "/app/create-post")}
              className="bg-[#13ec80] text-[#102219] hover:bg-[#10d671]"
            >
              {activeTab === "siguiendo" ? "Buscar usuarios" : "Crear post"}
            </Button>
          </div>
        )}

        {/* Footer info */}
        {!isLoading && activePosts.length > 0 && (
          <div className="flex justify-center py-10">
            <p className="text-xs text-center max-w-[200px]" style={{ color: "rgba(148,163,184,0.4)" }}>
              {activeTab === "para-ti" 
                ? "Este feed se actualiza con IA según tus progresos" 
                : "Has llegado al final de las novedades"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}