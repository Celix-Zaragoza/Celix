"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { PublicationCard } from "../../components/PublicationCard";
import { Button } from "../../components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";

const API = "http://localhost:3001/api/v1";

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

  const [posts, setPosts] = useState<any[]>([]);
  const [followingPosts, setFollowingPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

  // Cargar feed global
  useEffect(() => {
    const fetchPosts = async () => {
      setLoadingPosts(true);
      try {
        const res = await fetch(`${API}/posts?limit=10`, { headers: authHeaders() });
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
  }, []);

  // Cargar feed de siguiendo al cambiar al tab
  useEffect(() => {
    if (activeTab !== "siguiendo") return;
    const fetchFollowing = async () => {
      setLoadingFollowing(true);
      try {
        const res = await fetch(`${API}/posts/following?limit=10`, { headers: authHeaders() });
        if (res.ok) {
          const data = await res.json();
          setFollowingPosts(data.posts ?? []);
        }
      } catch {
        // silencioso
      } finally {
        setLoadingFollowing(false);
      }
    };
    fetchFollowing();
  }, [activeTab]);

  const activePosts = activeTab === "siguiendo" ? followingPosts : posts;
  const isLoading = activeTab === "siguiendo" ? loadingFollowing : loadingPosts;

  return (
    <div className="max-w-2xl mx-auto">

      {/* Tabs estilo Figma — línea inferior, sin card */}
      <div className="flex items-center border-b mb-4" style={{ borderColor: "rgba(148,163,184,0.15)" }}>
        {["siguiendo", "para-ti"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-3 text-sm font-semibold transition-colors relative"
            style={{ color: activeTab === tab ? "#f1f5f9" : "#94a3b8" }}
          >
            {tab === "siguiendo" ? "Siguiendo" : "Para ti"}
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
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
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
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#13ec80" }} />
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
                ? "Aún no sigues a nadie o los usuarios que sigues no han publicado"
                : "No hay publicaciones todavía"}
            </p>
            <Button
              onClick={() => router.push(activeTab === "siguiendo" ? "/app/search" : "/app/create-post")}
              className="bg-[#13ec80] text-[#102219] hover:bg-[#10d671]"
            >
              {activeTab === "siguiendo" ? "Buscar usuarios" : "Crear la primera"}
            </Button>
          </div>
        )}

        {/* Spinner de carga al final */}
        {!isLoading && activePosts.length > 0 && (
          <div className="flex justify-center py-6">
            <p className="text-xs" style={{ color: "rgba(148,163,184,0.4)" }}>
              Buscando más publicaciones para ti...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}