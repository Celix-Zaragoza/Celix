"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { deportesDisponibles, zonasZaragoza } from "../../../data/mockData";
import { toast } from "sonner";
import { Check, ChevronDown, ChevronUp, X } from "lucide-react";

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

export default function Page() {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  const initialFormData: FormData = useMemo(() => {
    // Convertir array deportesNivel a Record para el selector
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

  if (!user) return null;

  const deportesSeleccionados = Object.keys(formData.deportesNivel);

  const handleChange = <K extends keyof Omit<FormData, "deportesNivel">>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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

  const setNivel = (deporte: string, nivel: number) => {
    setFormData((prev) => ({
      ...prev,
      deportesNivel: { ...prev.deportesNivel, [deporte]: nivel },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (deportesSeleccionados.length === 0) {
      toast.error("Selecciona al menos un deporte");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/v1/users/me", {
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
    <div className="max-w-3xl mx-auto">
      <div className="bg-[#1e293b] rounded-xl border border-[rgba(148,163,184,0.2)] p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#f1f5f9]">Editar Perfil</h1>
          <Button variant="ghost" onClick={() => router.push("/app/profile")} className="text-[#94a3b8]">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre y alias */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[#f1f5f9]">Nombre completo</Label>
              <Input
                value={formData.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#f1f5f9]">Alias</Label>
              <Input
                value={formData.alias}
                onChange={(e) => handleChange("alias", e.target.value)}
                className="h-12"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label className="text-[#f1f5f9]">Biografía</Label>
            <Textarea
              value={formData.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              placeholder="Cuéntanos algo sobre ti..."
              rows={3}
            />
          </div>

          {/* Edad y zona */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[#f1f5f9]">Edad</Label>
              <Input
                type="number"
                value={formData.edad}
                onChange={(e) => handleChange("edad", parseInt(e.target.value, 10))}
                min="13"
                max="120"
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#f1f5f9]">Zona de Zaragoza</Label>
              <Select value={formData.zona} onValueChange={(v) => handleChange("zona", v)}>
                <SelectTrigger className="h-12">
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

          {/* Deportes con nivel */}
          <div className="space-y-3">
            <Label className="text-[#f1f5f9]">Deportes y nivel</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {deportesDisponibles.map((deporte) => {
                const seleccionado = formData.deportesNivel[deporte] !== undefined;
                const expandido = expandedDeporte === deporte;
                return (
                  <div key={deporte} className="flex flex-col">
                    <div className={`relative flex items-center justify-between rounded-lg border-2 transition-all
                      ${seleccionado
                        ? "border-[#13ec80] bg-[#13ec80]/10"
                        : "border-[#334155] hover:border-[#475569]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleDeporte(deporte)}
                        className="flex-1 px-4 py-3 text-left"
                      >
                        <span className={`text-sm font-medium ${seleccionado ? "text-[#13ec80]" : "text-[#94a3b8]"}`}>
                          {deporte}
                        </span>
                      </button>

                      {seleccionado && (
                        <button
                          type="button"
                          onClick={() => setExpandedDeporte(expandido ? null : deporte)}
                          className="px-3 py-3 text-[#13ec80]"
                        >
                          {expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}

                      {seleccionado && !expandido && (
                        <span className="absolute -top-2 -right-2 bg-[#13ec80] text-[#0f172a] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center pointer-events-none">
                          {formData.deportesNivel[deporte]}
                        </span>
                      )}
                    </div>

                    {seleccionado && expandido && (
                      <div className="mt-1 bg-[#0f172a] rounded-lg p-3 border border-[#334155]">
                        <p className="text-xs text-[#94a3b8] mb-2">Nivel en {deporte}:</p>
                        <div className="flex flex-col gap-1">
                          {NIVELES.map((n) => (
                            <button
                              key={n.value}
                              type="button"
                              onClick={() => { setNivel(deporte, n.value); setExpandedDeporte(null); }}
                              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all
                                ${formData.deportesNivel[deporte] === n.value
                                  ? "bg-[#13ec80] text-[#0f172a] font-semibold"
                                  : "text-[#94a3b8] hover:bg-[#1e293b]"
                                }`}
                            >
                              {formData.deportesNivel[deporte] === n.value && <Check className="w-3 h-3" />}
                              <span>{n.value} — {n.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Resumen selección */}
            {deportesSeleccionados.length > 0 && (
              <div className="bg-[#0f172a] rounded-lg p-4 border border-[#334155]">
                <p className="text-xs text-[#94a3b8] mb-3 uppercase tracking-wider">Tu selección</p>
                <div className="flex flex-wrap gap-2">
                  {deportesSeleccionados.map((d) => (
                    <span key={d} className="flex items-center gap-1 bg-[#13ec80]/10 text-[#13ec80] border border-[#13ec80]/30 rounded-full px-3 py-1 text-sm">
                      {d}
                      <span className="bg-[#13ec80] text-[#0f172a] rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
                        {formData.deportesNivel[d]}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-12 border-[#334155] text-[#94a3b8]"
              onClick={() => router.push("/app/profile")}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 bg-[#13ec80] text-[#102219] hover:bg-[#10d671]"
              disabled={loading || deportesSeleccionados.length === 0}
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}