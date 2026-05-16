/**
 * Archivo: frontend/app/app/profile/edit/page.tsx
 * Descripción: Página para editar el perfil de usuario, incluyendo avatar y deportes.
 */

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { deportesDisponibles, zonasZaragoza } from "../../../data/mockData";
import { toast } from "sonner";
import { Check, ChevronDown, ChevronUp, X, Camera } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const NIVELES = [
  { value: 1, label: "Principiante" },
  { value: 2, label: "Básico" },
  { value: 3, label: "Intermedio" },
  { value: 4, label: "Avanzado" },
  { value: 5, label: "Experto" },
];

type FormData = {
  nombre: string;
  alias: string;
  bio: string;
  edad: number;
  zona: string;
  deportesNivel: Record<string, number>;
};

const inputStyle: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#f1f5f9",
};

const selectWrap: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px",
  overflow: "hidden",
};

/**
 * Componente de página de /app/profile/edit que maneja la edición del perfil del usuario.
 */
export default function Page() {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  const initialFormData: FormData = useMemo(() => {
    const deportesNivelMap: Record<string, number> = {};
    (user?.deportesNivel ?? []).forEach((d) => {
      deportesNivelMap[d.deporte] = d.nivel;
    });
    return {
      nombre: user?.nombre ?? "",
      alias: user?.alias ?? "",
      bio: user?.bio ?? "",
      edad: user?.edad ?? 18,
      zona: user?.zona ?? zonasZaragoza[0],
      deportesNivel: deportesNivelMap,
    };
  }, [user]);

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [expandedDeporte, setExpandedDeporte] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);

  if (!user) return null;

  const deportesSeleccionados = Object.keys(formData.deportesNivel);

  /**
   * Maneja el cambio de los campos del formulario de edición de perfil.
   */
  const handleChange = <K extends keyof Omit<FormData, "deportesNivel">>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Procesa la selección del archivo de avatar y genera una vista previa.
   */
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  /**
   * Sube el avatar seleccionado a Cloudinary y devuelve la URL pública.
   */
  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "celix_posts");
    const res = await fetch("https://api.cloudinary.com/v1_1/du36wk1j8/image/upload", {
      method: "POST",
      body: fd,
    });
    if (!res.ok) throw new Error("Error subiendo imagen");
    const data = await res.json();
    return data.secure_url;
  };

  /**
   * Añade o quita un deporte seleccionado en el formulario de perfil.
   */
  const toggleDeporte = (deporte: string) => {
    setFormData((prev) => {
      const next = { ...prev.deportesNivel };
      if (next[deporte] !== undefined) {
        delete next[deporte];
        if (expandedDeporte === deporte) setExpandedDeporte(null);
      } else {
        next[deporte] = 3;
        setExpandedDeporte(deporte);
      }
      return { ...prev, deportesNivel: next };
    });
  };

  /**
   * Establece el nivel deportivo para un deporte seleccionado en el perfil.
   */
  const setNivel = (deporte: string, nivel: number) => {
    setFormData((prev) => ({
      ...prev,
      deportesNivel: { ...prev.deportesNivel, [deporte]: nivel },
    }));
  };

  /**
   * Envía los cambios de perfil al backend y actualiza el usuario en el contexto.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deportesSeleccionados.length === 0) {
      toast.error("Selecciona al menos un deporte");
      return;
    }
    setLoading(true);
    try {
      // Subir avatar si hay uno nuevo
      let avatarUrl = user?.avatar ?? "";
      if (avatarFile) {
        avatarUrl = await uploadImage(avatarFile);
      }

      const res = await fetch(`${API}/api/v1/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          alias: formData.alias,
          bio: formData.bio,
          edad: Number(formData.edad),
          zona: formData.zona,
          avatar: avatarUrl,
          deportesNivel: deportesSeleccionados.map((d) => ({
            deporte: d,
            nivel: formData.deportesNivel[d],
          })),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        updateUser(data.user);
        toast.success("Perfil actualizado correctamente");
        router.push("/app/profile");
      } else if (res.status === 409) {
        toast.error("El alias ya está en uso");
      } else {
        toast.error(data.message || "Error al actualizar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div
        className="rounded-2xl p-6 md:p-8"
        style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black" style={{ color: "#f1f5f9" }}>Editar Perfil</h1>
            <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>Actualiza tu información deportiva</p>
          </div>
          <button
            onClick={() => router.push("/app/profile")}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Avatar */}
          <div className="flex justify-center mb-2">
            <div className="relative w-24 h-24 group">
              <img
                src={avatarPreview || `https://api.dicebear.com/7.x/initials/svg?seed=${user.nombre}`}
                alt={user.nombre}
                className="w-24 h-24 rounded-full object-cover"
                style={{ border: "3px solid rgba(19,236,128,0.4)" }}
              />
              <label className="absolute inset-0 rounded-full flex items-center justify-center cursor-pointer bg-black/0 group-hover:bg-black/50 transition-all">
                <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-all" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          <p className="text-center text-xs -mt-2" style={{ color: "rgba(148,163,184,0.6)" }}>
            Haz clic en la foto para cambiarla
          </p>

          {/* Nombre y alias */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: "#13ec80" }}>
                Nombre completo
              </label>
              <input
                value={formData.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                className="w-full h-12 px-4 rounded-xl text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#13ec80")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: "#13ec80" }}>
                Alias
              </label>
              <input
                value={formData.alias}
                onChange={(e) => handleChange("alias", e.target.value)}
                className="w-full h-12 px-4 rounded-xl text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#13ec80")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: "#13ec80" }}>
              Biografía
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              placeholder="Cuéntanos algo sobre ti..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#13ec80")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          {/* Edad y zona */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: "#13ec80" }}>
                Edad
              </label>
              <input
                type="number"
                value={formData.edad}
                onChange={(e) => handleChange("edad", parseInt(e.target.value, 10))}
                min="13"
                max="120"
                className="w-full h-12 px-4 rounded-xl text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#13ec80")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: "#13ec80" }}>
                Zona de Zaragoza
              </label>
              <div style={selectWrap}>
                <Select value={formData.zona} onValueChange={(v) => handleChange("zona", v)}>
                  <SelectTrigger className="h-12 border-0 bg-transparent text-sm focus:ring-0" style={{ color: "#f1f5f9" }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {zonasZaragoza.map((zona) => (
                      <SelectItem key={zona} value={zona}>{zona}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Deportes con nivel */}
          <div>
            <label className="block text-xs font-bold mb-3 uppercase tracking-widest" style={{ color: "#13ec80" }}>
              Deportes y nivel
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {deportesDisponibles.map((deporte) => {
                const seleccionado = formData.deportesNivel[deporte] !== undefined;
                const expandido = expandedDeporte === deporte;
                return (
                  <div key={deporte} className="flex flex-col">
                    <div
                      className="relative flex items-center justify-between rounded-xl transition-all"
                      style={{
                        backgroundColor: seleccionado ? "rgba(19,236,128,0.12)" : "rgba(255,255,255,0.05)",
                        border: seleccionado ? "1px solid rgba(19,236,128,0.4)" : "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleDeporte(deporte)}
                        className="flex-1 px-4 py-3 text-left"
                      >
                        <span className="text-sm font-semibold" style={{ color: seleccionado ? "#13ec80" : "#94a3b8" }}>
                          {deporte}
                        </span>
                      </button>
                      {seleccionado && (
                        <button
                          type="button"
                          onClick={() => setExpandedDeporte(expandido ? null : deporte)}
                          className="px-3 py-3"
                          style={{ color: "#13ec80" }}
                        >
                          {expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}
                      {seleccionado && !expandido && (
                        <span
                          className="absolute -top-2 -right-2 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center pointer-events-none"
                          style={{ backgroundColor: "#13ec80", color: "#0a1628" }}
                        >
                          {formData.deportesNivel[deporte]}
                        </span>
                      )}
                    </div>

                    {seleccionado && expandido && (
                      <div
                        className="mt-1 rounded-xl p-3 space-y-1"
                        style={{ backgroundColor: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}
                      >
                        <p className="text-xs mb-2" style={{ color: "#94a3b8" }}>Nivel en {deporte}:</p>
                        {NIVELES.map((n) => (
                          <button
                            key={n.value}
                            type="button"
                            onClick={() => { setNivel(deporte, n.value); setExpandedDeporte(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
                            style={{
                              backgroundColor: formData.deportesNivel[deporte] === n.value ? "#13ec80" : "transparent",
                              color: formData.deportesNivel[deporte] === n.value ? "#0a1628" : "#94a3b8",
                              fontWeight: formData.deportesNivel[deporte] === n.value ? 600 : 400,
                            }}
                          >
                            {formData.deportesNivel[deporte] === n.value && <Check className="w-3 h-3" />}
                            <span>{n.value} — {n.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Resumen selección */}
            {deportesSeleccionados.length > 0 && (
              <div
                className="mt-4 rounded-xl p-4"
                style={{ backgroundColor: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <p className="text-xs mb-3 uppercase tracking-widest" style={{ color: "#94a3b8" }}>Tu selección</p>
                <div className="flex flex-wrap gap-2">
                  {deportesSeleccionados.map((d) => (
                    <span
                      key={d}
                      className="flex items-center gap-1 rounded-full px-3 py-1 text-sm"
                      style={{ backgroundColor: "rgba(19,236,128,0.1)", color: "#13ec80", border: "1px solid rgba(19,236,128,0.3)" }}
                    >
                      {d}
                      <span
                        className="rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: "#13ec80", color: "#0a1628" }}
                      >
                        {formData.deportesNivel[d]}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/app/profile")}
              className="flex-1 h-12 rounded-xl text-sm font-semibold transition-all"
              style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || deportesSeleccionados.length === 0}
              className="flex-1 h-12 rounded-xl font-bold text-sm transition-all disabled:opacity-60"
              style={{ backgroundColor: "#13ec80", color: "#0a1628" }}
            >
              {loading ? "Guardando..." : "Guardar cambios →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}