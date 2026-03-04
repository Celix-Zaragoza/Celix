"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { zonasZaragoza } from "../../data/mockData";
import { toast } from "sonner";

export default function CreateProfile1Client() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nombre = searchParams.get("nombre") ?? "";
  const email = searchParams.get("email") ?? "";

  const [formData, setFormData] = useState({
    alias: "",
    edad: "",
    zona: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.alias || !formData.edad || !formData.zona) {
      toast.error("Por favor, completa todos los campos");
      return;
    }

    const edad = parseInt(formData.edad, 10);
    if (Number.isNaN(edad) || edad < 13 || edad > 120) {
      toast.error("Por favor, ingresa una edad válida");
      return;
    }

    const qs = new URLSearchParams({
      nombre,
      email,
      alias: formData.alias,
      edad: String(edad),
      zona: formData.zona,
    }).toString();

    router.push(`/auth/create-profile-2?${qs}`);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1e293b] rounded-2xl shadow-2xl p-8 border border-[rgba(148,163,184,0.2)]">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#13ec80]">Paso 1 de 2</span>
              <span className="text-sm text-[#94a3b8]">50%</span>
            </div>
            <div className="w-full bg-[#334155] rounded-full h-2">
              <div className="bg-[#13ec80] h-2 rounded-full" style={{ width: "50%" }} />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#f1f5f9] mb-2">Personaliza tu perfil</h1>
            <p className="text-[#94a3b8]">Cuéntanos sobre ti</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="alias">Alias de usuario</Label>
              <Input
                id="alias"
                name="alias"
                type="text"
                placeholder="deportista_zgz"
                value={formData.alias}
                onChange={handleChange}
                className="h-12"
              />
              <p className="text-sm text-gray-500">Este será tu nombre de usuario único en CELIX</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edad">Edad</Label>
              <Input
                id="edad"
                name="edad"
                type="number"
                placeholder="25"
                min="13"
                max="120"
                value={formData.edad}
                onChange={handleChange}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zona">Zona de Zaragoza</Label>
              <Select
                value={formData.zona}
                onValueChange={(value: string) => setFormData((prev) => ({ ...prev, zona: value }))}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecciona tu zona" />
                </SelectTrigger>
                <SelectContent>
                  {zonasZaragoza.map((zona) => (
                    <SelectItem key={zona} value={zona}>
                      {zona}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">Esto nos ayudará a conectarte con deportistas cercanos</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12"
                onClick={() => router.push("/auth/register")}
              >
                Atrás
              </Button>
              <Button type="submit" className="flex-1 h-12">
                Siguiente
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}