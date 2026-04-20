"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { PublicationCard } from "../../components/PublicationCard";
import { Edit, MapPin, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

const COLORS = ["#13ec80", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

export default function Page() {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [stats, setStats] = useState<{
    totalPosts: number;
    totalLikes: number;
    actividadSemanal: { dia: string; actividades: number }[];
    distribucionDeportes: { name: string; value: number }[];
  } | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API}/api/v1/users/me/stats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch {
        // silencioso
      }
    };
    fetchStats();
  }, [user?.id]);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(`${API}/api/v1/users/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.ok) {
          const data = await res.json();
          updateUser({ ...data.user, isAdmin: data.user.rol === "ADMIN" });
        }
      } catch {
        // usa los datos del contexto si falla
      }
    };
    fetchMe();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const fetchPosts = async () => {
      setLoadingPosts(true);
      try {
        const res = await fetch(`${API}/api/v1/posts/user/${user.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
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
  }, [user?.id]);

  if (!user) return null;

  const deportesNivel = user.deportesNivel ?? [];
  const deportesData = stats?.distribucionDeportes ?? [];

  const activityData = stats?.actividadSemanal ?? [];

  const tooltipStyle = {
    backgroundColor: "rgba(15,35,24,0.95)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    color: "#f1f5f9",
  };

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header del perfil */}
      <div
        className="rounded-2xl p-6 mb-5"
        style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <img
            src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.nombre}`}
            alt={user.nombre}
            className="w-24 h-24 rounded-full object-cover flex-shrink-0"
            style={{ border: "3px solid rgba(19,236,128,0.4)" }}
          />

          <div className="flex-1 min-w-0">
            {/* Nombre + botón editar */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
              <div>
                <h1 className="text-2xl font-black" style={{ color: "#f1f5f9" }}>{user.nombre}</h1>
                <p className="text-sm" style={{ color: "#94a3b8" }}>@{user.alias}</p>
              </div>
              <button
                onClick={() => router.push("/app/profile/edit")}
                className="flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-bold transition-all self-start"
                style={{ backgroundColor: "#13ec80", color: "#0a1628" }}
              >
                <Edit className="w-3.5 h-3.5" />
                Editar perfil
              </button>
            </div>

            {/* Info */}
            <div className="flex flex-wrap items-center gap-3 text-xs mb-3" style={{ color: "#94a3b8" }}>
              {user.zona && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" style={{ color: "#13ec80" }} />
                  <span>{user.zona}</span>
                </div>
              )}
              {user.edad && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" style={{ color: "#13ec80" }} />
                  <span>{user.edad} años</span>
                </div>
              )}
            </div>

            {user.bio && (
              <p className="text-sm mb-4 leading-relaxed" style={{ color: "#e2e8f0" }}>{user.bio}</p>
            )}

            {/* Contadores */}
            <div className="flex gap-5">
              <button
                onClick={() => router.push("/app/followers")}
                className="hover:opacity-80 transition-opacity"
              >
                <span className="font-black text-lg" style={{ color: "#f1f5f9" }}>{user.numSeguidores ?? 0}</span>
                <span className="text-xs ml-1" style={{ color: "#94a3b8" }}>Seguidores</span>
              </button>
              <button
                onClick={() => router.push("/app/following")}
                className="hover:opacity-80 transition-opacity"
              >
                <span className="font-black text-lg" style={{ color: "#f1f5f9" }}>{user.numSiguiendo ?? 0}</span>
                <span className="text-xs ml-1" style={{ color: "#94a3b8" }}>Siguiendo</span>
              </button>
              <div>
                <span className="font-black text-lg" style={{ color: "#f1f5f9" }}>{posts.length}</span>
                <span className="text-xs ml-1" style={{ color: "#94a3b8" }}>Publicaciones</span>
              </div>
            </div>
          </div>
        </div>

        {/* Deportes */}
        {deportesNivel.length > 0 && (
          <div
            className="flex flex-wrap gap-2 mt-5 pt-5"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            {deportesNivel.map((d: any) => (
              <span
                key={d.deporte}
                className="px-3 py-1 text-xs font-semibold rounded-full"
                style={{
                  backgroundColor: "rgba(19,236,128,0.1)",
                  color: "#13ec80",
                  border: "1px solid rgba(19,236,128,0.25)",
                }}
              >
                ⚡ {d.deporte} · Nv.{d.nivel}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Actividad semanal */}
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4" style={{ color: "#13ec80" }} />
            <h2 className="text-base font-black" style={{ color: "#f1f5f9" }}>Actividad Semanal</h2>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="dia" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#f1f5f9" }} />
              <Bar dataKey="actividades" fill="#13ec80" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución deportes */}
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-4 h-4" style={{ color: "#13ec80" }} />
            <h2 className="text-base font-black" style={{ color: "#f1f5f9" }}>Distribución por Deporte</h2>
          </div>
          {deportesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={deportesData}
                  cx="50%" cy="50%"
                  labelLine={false}
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={70}
                  dataKey="value"
                >
                  {deportesData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-12 text-sm" style={{ color: "#94a3b8" }}>
              Crea posts para ver la distribución por deporte de tus actividades
            </p>
          )}
        </div>
      </div>

      {/* Publicaciones */}
      <div>
        <h2 className="text-lg font-black mb-4" style={{ color: "#f1f5f9" }}>
          Mis Publicaciones
        </h2>

        {loadingPosts ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl h-40 animate-pulse"
                style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
              />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PublicationCard key={post._id?.toString() ?? post.id} publicacion={post} />
            ))}
          </div>
        ) : (
          <div
            className="rounded-2xl p-12 text-center"
            style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="text-sm mb-4" style={{ color: "#94a3b8" }}>
              Aún no has creado ninguna publicación
            </p>
            <button
              onClick={() => router.push("/app/create-post")}
              className="px-5 h-10 rounded-xl text-sm font-bold transition-all"
              style={{ backgroundColor: "#13ec80", color: "#0a1628" }}
            >
              Crear primera publicación →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}