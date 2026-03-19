"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { deportesDisponibles, zonasZaragoza } from "../../data/mockData";
import { toast } from "sonner";
import { ImageIcon, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

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

    setFile(selectedFile); // 👈 GUARDAS EL FILE REAL

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(selectedFile);
  };
  
  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "tu_preset");

    const res = await fetch("https://api.cloudinary.com/v1_1/TU_CLOUD/image/upload", {
      method: "POST",
      body: formData,
    });

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
      let imageUrl = "";

      // 👇 SUBES LA IMAGEN SOLO SI EXISTE
      if (file) {
        imageUrl = await uploadImage(file);
      }

      const res = await fetch("http://localhost:3001/api/v1/posts", {
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
          imagen: imageUrl, // 👈 AQUÍ VA LA URL, NO base64
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

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-[#1e293b] rounded-xl border border-[rgba(148,163,184,0.2)] p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#f1f5f9]">Crear publicación</h1>
          <Button
            variant="ghost"
            onClick={() => router.push("/app/feed")}
            className="text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#334155]"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Info */}
          {user && (
            <div className="flex items-center gap-3 pb-4 border-b border-[rgba(148,163,184,0.2)]">
              <img
            src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.nombre}`}
            alt={user.nombre}
            className="w-16 h-16 rounded-full object-cover border-4 border-[#13ec80]"
          />
              <div>
                <h3 className="font-bold text-[#f1f5f9]">{user.nombre}</h3>
                <p className="text-sm text-[#94a3b8]">@{user.alias}</p>
              </div>
            </div>
          )}

          {/* Deporte y Zona */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[#f1f5f9]">Deporte *</Label>
              <Select
                value={formData.deporte}
                onValueChange={(value: string) => handleChange("deporte", value)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecciona un deporte" />
                </SelectTrigger>
                <SelectContent>
                  {deportesDisponibles.map((deporte) => (
                    <SelectItem key={deporte} value={deporte}>
                      {deporte}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[#f1f5f9]">Zona *</Label>
              <Select
                value={formData.ubicacion}
                onValueChange={(value: string) => handleChange("ubicacion", value)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecciona una zona" />
                </SelectTrigger>
                <SelectContent>
                  {zonasZaragoza.map((zona) => (
                    <SelectItem key={zona} value={zona}>
                      {zona}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contenido */}
          <div className="space-y-2">
            <Label className="text-[#f1f5f9]">Contenido *</Label>
            <Textarea
              value={formData.contenido}
              onChange={(e) => handleChange("contenido", e.target.value)}
              placeholder="Comparte tu experiencia deportiva..."
              rows={5}
              maxLength={500}
            />
            <p className="text-sm text-[#94a3b8] text-right">
              {formData.contenido.length}/500
            </p>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-[#f1f5f9]">Imagen (opcional)</Label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute top-2 right-2 bg-[#0f172a]/80 rounded-full p-2 hover:bg-[#0f172a] transition-colors"
                >
                  <X className="w-4 h-4 text-[#f1f5f9]" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-[#334155] rounded-lg cursor-pointer hover:border-[#13ec80]/50 transition-colors group">
                <ImageIcon className="w-10 h-10 text-[#334155] group-hover:text-[#13ec80]/50 mb-2 transition-colors" />
                <span className="text-sm text-[#94a3b8]">Haz clic para subir una imagen</span>
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
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-12 border-[#334155] text-[#94a3b8] hover:bg-[#334155]"
              onClick={() => router.push("/app/feed")}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 bg-[#13ec80] text-[#102219] hover:bg-[#10d671]"
              disabled={loading}
            >
              {loading ? "Publicando..." : "Publicar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}