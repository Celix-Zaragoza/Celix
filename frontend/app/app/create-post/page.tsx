"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { deportesDisponibles, zonasZaragoza } from "../../data/mockData";
import { toast } from "sonner";
import { ImageIcon, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export default function Page() {
  const router = useRouter();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    deporte: "",
    ubicacion: "",
    contenido: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(selectedFile);
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "celix_posts");
    const res = await fetch("https://api.cloudinary.com/v1_1/du36wk1j8/image/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Error subiendo imagen");
    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.deporte || !formData.ubicacion || !formData.contenido) {
      toast.error("Por favor, completa todos los campos obligatorios");
      return;
    }
    setLoading(true);
    try {
      let imageUrl: string | null = null;
      if (file) imageUrl = await uploadImage(file);

      const res = await fetch(`${API}/api/v1/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          contenido: formData.contenido,
          deporte: formData.deporte,
          ubicacion: formData.ubicacion,
          tipo: "entrenamiento",
          imagen: imageUrl,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Publicación creada exitosamente");
      router.push("/app/feed");
    } catch (error) {
      console.error(error);
      toast.error("Hubo un error al crear la publicación");
    } finally {
      setLoading(false);
    }
  };

  const selectTriggerStyle = "h-12 rounded-xl text-sm bg-transparent border-0 text-[#f1f5f9] focus:ring-0";

  return (
    <div className="max-w-4xl mx-auto">
      <div
        className="rounded-2xl p-6 md:p-8"
        style={{
          backgroundColor: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black" style={{ color: "#f1f5f9" }}>
              Crear publicación
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>
              Comparte tu actividad deportiva
            </p>
          </div>
          <button
            onClick={() => router.push("/app/feed")}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              color: "#94a3b8",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* User Info */}
          {user && (
            <div
              className="flex items-center gap-3 pb-5"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.nombre}`}
                alt={user.nombre}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                style={{ border: "2px solid rgba(19,236,128,0.4)" }}
              />
              <div>
                <p className="font-bold text-sm" style={{ color: "#f1f5f9" }}>{user.nombre}</p>
                <p className="text-xs" style={{ color: "#94a3b8" }}>@{user.alias}</p>
              </div>
            </div>
          )}

          {/* Deporte y Zona */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-xs font-bold mb-2 uppercase tracking-widest"
                style={{ color: "#13ec80" }}
              >
                Deporte *
              </label>
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Select
                  value={formData.deporte}
                  onValueChange={(value) => handleChange("deporte", value)}
                >
                  <SelectTrigger className={selectTriggerStyle}>
                    <SelectValue placeholder="Selecciona un deporte" />
                  </SelectTrigger>
                  <SelectContent>
                    {deportesDisponibles.map((deporte) => (
                      <SelectItem key={deporte} value={deporte}>{deporte}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-bold mb-2 uppercase tracking-widest"
                style={{ color: "#13ec80" }}
              >
                Zona *
              </label>
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Select
                  value={formData.ubicacion}
                  onValueChange={(value) => handleChange("ubicacion", value)}
                >
                  <SelectTrigger className={selectTriggerStyle}>
                    <SelectValue placeholder="Selecciona una zona" />
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

          {/* Contenido */}
          <div>
            <label
              className="block text-xs font-bold mb-2 uppercase tracking-widest"
              style={{ color: "#13ec80" }}
            >
              Contenido *
            </label>
            <textarea
              value={formData.contenido}
              onChange={(e) => handleChange("contenido", e.target.value)}
              placeholder="Comparte tu experiencia deportiva..."
              rows={5}
              maxLength={500}
              className="w-full rounded-xl p-4 text-sm resize-none outline-none transition-all"
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#f1f5f9",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#13ec80")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
            <p className="text-xs mt-1.5 text-right" style={{ color: "rgba(148,163,184,0.6)" }}>
              {formData.contenido.length}/500
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <label
              className="block text-xs font-bold mb-2 uppercase tracking-widest"
              style={{ color: "#13ec80" }}
            >
              Imagen <span style={{ color: "#94a3b8", textTransform: "none", fontSize: "11px" }}>(opcional)</span>
            </label>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-56 object-cover"
                />
                <button
                  type="button"
                  onClick={() => { setImagePreview(null); setFile(null); }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                  style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "#f1f5f9" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label
                className="flex flex-col items-center justify-center h-36 rounded-xl cursor-pointer transition-all group"
                style={{
                  border: "2px dashed rgba(255,255,255,0.1)",
                  backgroundColor: "rgba(255,255,255,0.02)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(19,236,128,0.3)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
              >
                <ImageIcon className="w-8 h-8 mb-2" style={{ color: "rgba(148,163,184,0.4)" }} />
                <span className="text-sm" style={{ color: "#94a3b8" }}>
                  Haz clic para subir una imagen
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/app/feed")}
              className="flex-1 h-12 rounded-xl text-sm font-semibold transition-all"
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                color: "#94a3b8",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-12 rounded-xl font-bold text-sm transition-all"
              style={{
                backgroundColor: loading ? "#10d671" : "#13ec80",
                color: "#0a1628",
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? "Publicando..." : "Publicar →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}