"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { PublicationCard } from "../../components/PublicationCard";
import { deportesDisponibles } from "../../data/mockData";
import { Button } from "../../components/ui/button";
import { Sparkles, TrendingUp, Loader2 } from "lucide-react";

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
  const [selectedDeporte, setSelectedDeporte] = useState<string | null>(null);

  const [posts, setPosts] = useState<any[]>([]);
  const [followingPosts, setFollowingPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

  // Cargar feed global
  useEffect(() => {
    const fetchPosts = async () => {
      setLoadingPosts(true);
      try {
        const params = new URLSearchParams({ limit: "10" });
        if (selectedDeporte) params.set("deporte", selectedDeporte);

        const res = await fetch(`${API}/posts?${params}`, { headers: authHeaders() });
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
  }, [selectedDeporte]);

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

  const filteredPosts = selectedDeporte
    ? posts.filter((p) => p.deporte === selectedDeporte)
    : posts;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#f1f5f9] mb-2">Feed de actividades</h1>
        <p className="text-[#94a3b8]">
          Descubre lo que está pasando en la comunidad deportiva de Zaragoza
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full grid grid-cols-2 h-12">
          <TabsTrigger value="para-ti" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Para ti
          </TabsTrigger>
          <TabsTrigger value="siguiendo" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Siguiendo
          </TabsTrigger>
        </TabsList>

        {/* Tab: Para ti */}
        <TabsContent value="para-ti" className="space-y-4 mt-6">
          {loadingPosts ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#13ec80]" />
            </div>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <PublicationCard key={post._id ?? post.id} publicacion={post} />
            ))
          ) : (
            <div className="bg-[#1e293b] rounded-xl border border-[rgba(148,163,184,0.2)] p-12 text-center">
              <p className="text-[#94a3b8]">
                {selectedDeporte
                  ? `No hay publicaciones de ${selectedDeporte} todavía`
                  : "No hay publicaciones todavía"}
              </p>
              <Button
                onClick={() => router.push("/app/create-post")}
                className="mt-4 bg-[#13ec80] text-[#102219] hover:bg-[#10d671]"
              >
                Crear la primera
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Tab: Siguiendo */}
        <TabsContent value="siguiendo" className="space-y-4 mt-6">
          {loadingFollowing ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#13ec80]" />
            </div>
          ) : followingPosts.length > 0 ? (
            followingPosts.map((post) => (
              <PublicationCard key={post._id ?? post.id} publicacion={post} />
            ))
          ) : (
            <div className="bg-[#1e293b] rounded-xl border border-[rgba(148,163,184,0.2)] p-12 text-center">
              <p className="text-[#94a3b8] mb-4">
                Aún no sigues a nadie o los usuarios que sigues no han publicado
              </p>
              <Button
                onClick={() => router.push("/app/search")}
                className="bg-[#13ec80] text-[#102219] hover:bg-[#10d671]"
              >
                Buscar usuarios
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Recomendaciones — personalizadas con deportes del usuario */}
      {activeTab === "para-ti" && (
        <div className="bg-[#1e293b] rounded-xl p-6 border border-[rgba(148,163,184,0.2)]">
          <div className="flex items-start gap-4">
            <div className="bg-[#13ec80] rounded-full p-3">
              <Sparkles className="w-6 h-6 text-[#102219]" />
            </div>
            <div>
              <h3 className="font-bold text-[#f1f5f9] mb-2">
                Recomendaciones personalizadas
              </h3>
              <p className="text-[#94a3b8] text-sm mb-3">
                Basadas en tus deportes y tu zona
              </p>
              <div className="flex flex-wrap gap-2">
                {user?.zona && (
                  <span className="px-3 py-1 bg-[#334155] rounded-full text-sm font-medium text-[#f1f5f9]">
                    📍 {user.zona}
                  </span>
                )}
                {(user?.deportesNivel ?? []).slice(0, 3).map((d: any) => (
                  <span
                    key={d.deporte}
                    className="px-3 py-1 bg-[#334155] rounded-full text-sm font-medium text-[#f1f5f9]"
                  >
                    {d.deporte}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}