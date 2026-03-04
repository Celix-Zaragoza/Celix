"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { deportesDisponibles } from "../../data/mockData";
import { toast } from "sonner";
import { Image, MapPin, X } from "lucide-react";
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

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.deporte || !formData.ubicacion || !formData.contenido) {
      toast.error("Por favor, completa todos los campos obligatorios");
      return;
    }

    toast.success("Publicación creada exitosamente");
    router.push("/app/feed");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Crear publicación</h1>
          <Button variant="ghost" onClick={() => router.push("/app/feed")}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Info */}
          {user && (
            <div className="flex items-center gap-3 pb-4 border-b">
              <img src={user.avatar} alt={user.nombre} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <h3 className="font-bold text-gray-900">{user.nombre}</h3>
                <p className="text-sm text-gray-600">@{user.alias}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="deporte">Deporte *</Label>
              <Select value={formData.deporte} onValueChange={(value:string) => handleChange("deporte", value)}>
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
              <Label htmlFor="ubicacion">Ubicación *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="ubicacion"
                  value={formData.ubicacion}
                  onChange={(e) => handleChange("ubicacion", e.target.value)}
                  placeholder="¿Dónde lo practicaste?"
                  className="h-12 pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contenido">Contenido *</Label>
            <Textarea
              id="contenido"
              value={formData.contenido}
              onChange={(e) => handleChange("contenido", e.target.value)}
              placeholder="Comparte tu experiencia deportiva..."
              rows={5}
            />
            <p className="text-sm text-gray-500">{formData.contenido.length}/500 caracteres</p>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Imagen (opcional)</Label>
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                <Image className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Haz clic para subir una imagen</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => router.push("/app/feed")}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 h-12">
              Publicar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}