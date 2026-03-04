"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Slider } from "../../components/ui/slider";
import { deportesDisponibles } from "../../data/mockData";
import { toast } from "sonner";
import { Check } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();

  // Recuperamos lo que venía del paso 1 (query)
  const userData = useMemo(() => {
    const nombre = searchParams.get("nombre") ?? "";
    const email = searchParams.get("email") ?? "";
    const alias = searchParams.get("alias") ?? "";
    const zona = searchParams.get("zona") ?? "";
    const edadRaw = searchParams.get("edad") ?? "";
    const edad = edadRaw ? Number.parseInt(edadRaw, 10) : undefined;

    return { nombre, email, alias, zona, edad };
  }, [searchParams]);

  const [deportes, setDeportes] = useState<string[]>([]);
  const [nivelGeneral, setNivelGeneral] = useState<number>(50);
  const [loading, setLoading] = useState(false);

  const toggleDeporte = (deporte: string) => {
    setDeportes((prev) => (prev.includes(deporte) ? prev.filter((d) => d !== deporte) : [...prev, deporte]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (deportes.length === 0) {
      toast.error("Selecciona al menos un deporte");
      return;
    }

    setLoading(true);
    try {
      const success = await register({
        ...userData,
        deportes,
        nivelGeneral,
      });

      if (success) {
        toast.success("¡Perfil creado exitosamente!");
        router.push("/app/feed");
      } else {
        toast.error("Error al crear el perfil");
      }
    } catch {
      toast.error("Error al crear el perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Volvemos a step1 preservando datos no sensibles
    const qs = new URLSearchParams({
      nombre: userData.nombre ?? "",
      email: userData.email ?? "",
    }).toString();
    router.push(`/auth/create-profile-1?${qs}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-600">Paso 2 de 2</span>
              <span className="text-sm text-gray-500">100%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 w-full transition-all duration-300"></div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">¿Qué deportes practicas?</h1>
            <p className="text-gray-600">Selecciona todos los deportes que te interesan</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Deportes */}
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
                        deportes.includes(deporte)
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }
                    `}
                  >
                    {deportes.includes(deporte) && (
                      <div className="absolute -top-2 -right-2 bg-blue-600 rounded-full p-1">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <span className="text-sm font-medium">{deporte}</span>
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                {deportes.length === 0
                  ? "Selecciona al menos un deporte"
                  : `${deportes.length} deporte${deportes.length > 1 ? "s" : ""} seleccionado${
                      deportes.length > 1 ? "s" : ""
                    }`}
              </p>
            </div>

            {/* Nivel General */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Nivel general</Label>
                <span className="text-2xl font-bold text-blue-600">{nivelGeneral}%</span>
              </div>
              <Slider
                value={[nivelGeneral]}
                onValueChange={(values:number[]) => setNivelGeneral(values[0])}
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
              <p className="text-sm text-gray-500">Indica tu nivel deportivo general</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1 h-12" onClick={handleBack}>
                Atrás
              </Button>
              <Button type="submit" className="flex-1 h-12" disabled={loading || deportes.length === 0}>
                {loading ? "Creando perfil..." : "Finalizar"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}