"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Slider } from "../../../components/ui/slider";
import { deportesDisponibles, zonasZaragoza } from "../../../data/mockData";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

export default function Page() {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const [formData, setFormData] = useState({
    nombre: user.nombre,
    alias: user.alias,
    bio: user.bio || "",
    edad: user.edad,
    zona: user.zona,
    deportes: user.deportes,
    nivelGeneral: user.nivelGeneral,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDeporte = (deporte: string) => {
    if (formData.deportes.includes(deporte)) {
      handleChange(
        "deportes",
        formData.deportes.filter((d) => d !== deporte)
      );
    } else {
      handleChange("deportes", [...formData.deportes, deporte]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.deportes.length === 0) {
      toast.error("Selecciona al menos un deporte");
      return;
    }

    updateUser(formData);
    toast.success("Perfil actualizado correctamente");
    router.push("/app/profile");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Editar Perfil</h1>
          <Button variant="ghost" onClick={() => router.push("/app/profile")}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alias">Alias</Label>
              <Input
                id="alias"
                value={formData.alias}
                onChange={(e) => handleChange("alias", e.target.value)}
                className="h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografía</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              placeholder="Cuéntanos algo sobre ti..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="edad">Edad</Label>
              <Input
                id="edad"
                type="number"
                value={formData.edad}
                onChange={(e) => handleChange("edad", parseInt(e.target.value, 10))}
                min="13"
                max="120"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zona">Zona de Zaragoza</Label>
              <Select value={formData.zona} onValueChange={(value:string) => handleChange("zona", value)}>
                <SelectTrigger className="h-12">
                  <SelectValue />
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

          <div className="space-y-4">
            <Label>Deportes</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {deportesDisponibles.map((deporte) => (
                <button
                  key={deporte}
                  type="button"
                  onClick={() => toggleDeporte(deporte)}
                  className={`
                    relative px-4 py-3 rounded-lg border-2 transition-all
                    ${
                      formData.deportes.includes(deporte)
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }
                  `}
                >
                  {formData.deportes.includes(deporte) && (
                    <div className="absolute -top-2 -right-2 bg-blue-600 rounded-full p-1">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <span className="text-sm font-medium">{deporte}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Nivel general</Label>
              <span className="text-2xl font-bold text-blue-600">{formData.nivelGeneral}%</span>
            </div>
            <Slider
              value={[formData.nivelGeneral]}
              onValueChange={(values:number[]) => handleChange("nivelGeneral", values[0])}
              min={0}
              max={100}
              step={5}
              className="py-4"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>Principiante</span>
              <span>Intermedio</span>
              <span>Avanzado</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => router.push("/app/profile")}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 h-12">
              Guardar cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}