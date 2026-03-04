"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";
import { PublicationCard } from "../../components/PublicationCard";
import { mockPublicaciones } from "../../data/mockData";
import { Edit, MapPin, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Page() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const myPublicaciones = mockPublicaciones.filter((p) => String(p.usuarioId) === String(user.id));

  const activityData = [
    { dia: "Lun", actividades: 3 },
    { dia: "Mar", actividades: 5 },
    { dia: "Mié", actividades: 4 },
    { dia: "Jue", actividades: 6 },
    { dia: "Vie", actividades: 7 },
    { dia: "Sáb", actividades: 4 },
    { dia: "Dom", actividades: 2 },
  ];

  const deportesData = user.deportes.map((deporte: string, index: number) => ({
    name: deporte,
    value: 10 + (index * 5),
  }));

  const COLORS = ["#13ec80", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="bg-[#1e293b] rounded-xl shadow-sm border border-[rgba(148,163,184,0.2)] p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <img
            src={user.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400"}
            alt={user.nombre}
            className="w-32 h-32 rounded-full object-cover border-4 border-[#13ec80]"
          />
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
              <div>
                <h1 className="text-3xl font-bold text-[#f1f5f9]">{user.nombre}</h1>
                <p className="text-[#94a3b8]">@{user.alias}</p>
              </div>
              <Button
                onClick={() => router.push("/app/profile/edit")}
                className="mt-3 md:mt-0 bg-[#13ec80] text-[#102219] hover:bg-[#10d671]"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar perfil
              </Button>
            </div>

            <div className="flex items-center gap-4 text-sm text-[#94a3b8] mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{user.zona}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{user.edad} años</span>
              </div>
            </div>

            <p className="text-[#f1f5f9] mb-4">{user.bio}</p>

            <div className="flex gap-6">
              <button onClick={() => router.push("/app/followers")} className="text-center hover:underline">
                <span className="font-bold text-[#f1f5f9]">{user.seguidores}</span>
                <span className="text-[#94a3b8] ml-1">Seguidores</span>
              </button>
              <button onClick={() => router.push("/app/following")} className="text-center hover:underline">
                <span className="font-bold text-[#f1f5f9]">{user.siguiendo}</span>
                <span className="text-[#94a3b8] ml-1">Siguiendo</span>
              </button>
              <div className="text-center">
                <span className="font-bold text-[#f1f5f9]">{user.publicaciones}</span>
                <span className="text-[#94a3b8] ml-1">Publicaciones</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sports Tags */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-[rgba(148,163,184,0.2)]">
          {user.deportes.map((deporte: string) => (
            <span key={deporte} className="px-3 py-1 bg-[#13ec80] text-[#102219] rounded-full text-sm font-medium">
              {deporte}
            </span>
          ))}
          <span className="px-3 py-1 bg-[#13ec80] text-[#102219] rounded-full text-sm font-medium">
            Nivel: {user.nivelGeneral}%
          </span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly Activity */}
        <div className="bg-[#1e293b] rounded-xl shadow-sm border border-[rgba(148,163,184,0.2)] p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-[#13ec80]" />
            <h2 className="text-xl font-bold text-[#f1f5f9]">Actividad Semanal</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey="dia" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid rgba(148,163,184,0.2)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#f1f5f9" }}
              />
              <Bar dataKey="actividades" fill="#13ec80" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sports Distribution */}
        <div className="bg-[#1e293b] rounded-xl shadow-sm border border-[rgba(148,163,184,0.2)] p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-[#13ec80]" />
            <h2 className="text-xl font-bold text-[#f1f5f9]">Distribución por Deporte</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={deportesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: { name?: string; percent?: number }) => 
                  `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {deportesData.map((_, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid rgba(148,163,184,0.2)",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* My Publications */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#f1f5f9] mb-4">Mis Publicaciones</h2>
        {myPublicaciones.length > 0 ? (
          <div className="space-y-4">
            {myPublicaciones.map((publicacion) => (
              <PublicationCard key={publicacion.id} publicacion={publicacion} />
            ))}
          </div>
        ) : (
          <div className="bg-[#1e293b] rounded-xl shadow-sm border border-[rgba(148,163,184,0.2)] p-12 text-center">
            <p className="text-[#94a3b8] mb-4">Aún no has creado ninguna publicación</p>
            <Button
              onClick={() => router.push("/app/create-post")}
              className="bg-[#13ec80] text-[#102219] hover:bg-[#10d671]"
            >
              Crear primera publicación
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}