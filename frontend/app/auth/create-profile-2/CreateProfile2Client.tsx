"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { deportesDisponibles } from "../../data/mockData";
import { toast } from "sonner";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

const NIVELES = [
  { value: 1, label: "Principiante" },
  { value: 2, label: "Básico" },
  { value: 3, label: "Intermedio" },
  { value: 4, label: "Avanzado" },
  { value: 5, label: "Experto" },
];

export default function CreateProfile2Client() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const userData = useMemo(() => {
    const nombre = searchParams.get("nombre") ?? "";
    const email = searchParams.get("email") ?? "";
    const alias = searchParams.get("alias") ?? "";
    const zona = searchParams.get("zona") ?? "";
    const edadRaw = searchParams.get("edad") ?? "";
    const edad = edadRaw ? Number.parseInt(edadRaw, 10) : undefined;
    return { nombre, email, alias, zona, edad };
  }, [searchParams]);

  // Map de deporte -> nivel (1-5)
  const [deportesNivel, setDeportesNivel] = useState<Record<string, number>>({});
  const [expandedDeporte, setExpandedDeporte] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const deportesSeleccionados = Object.keys(deportesNivel);

  const toggleDeporte = (deporte: string) => {
    setDeportesNivel((prev) => {
      if (prev[deporte] !== undefined) {
        const next = { ...prev };
        delete next[deporte];
        if (expandedDeporte === deporte) setExpandedDeporte(null);
        return next;
      }
      setExpandedDeporte(deporte);
      return { ...prev, [deporte]: 3 };
    });
  };

  const setNivel = (deporte: string, nivel: number) => {
    setDeportesNivel((prev) => ({ ...prev, [deporte]: nivel }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (deportesSeleccionados.length === 0) {
      toast.error("Selecciona al menos un deporte");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        edad: userData.edad,
        zona: userData.zona,
        deportesNivel: deportesSeleccionados.map((d) => ({
          deporte: d,
          nivel: deportesNivel[d],
        })),
      };

      const res = await fetch("http://localhost:3001/api/v1/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("¡Perfil creado exitosamente!");
        router.push("/app/feed");
      } else if (res.status === 401) {
        toast.error("No autenticado. Por favor, inicia sesión de nuevo.");
      } else {
        toast.error(data.message || "Error al actualizar perfil");
      }
    } catch {
      toast.error("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    const qs = new URLSearchParams({
      nombre: userData.nombre ?? "",
      email: userData.email ?? "",
      alias: userData.alias ?? "",
    }).toString();
    router.push(`/auth/create-profile-1?${qs}`);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="bg-[#1e293b] rounded-2xl shadow-2xl p-8 border border-[rgba(148,163,184,0.2)]">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#13ec80]">Paso 2 de 2</span>
              <span className="text-sm text-[#94a3b8]">100%</span>
            </div>
            <div className="w-full bg-[#334155] rounded-full h-2">
              <div className="bg-[#13ec80] h-2 rounded-full w-full transition-all duration-300" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#f1f5f9] mb-2">¿Qué deportes practicas?</h1>
            <p className="text-[#94a3b8]">Selecciona tus deportes e indica tu nivel en cada uno</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grid de deportes */}
            <div className="space-y-3">
              <Label className="text-[#f1f5f9]">Deportes</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {deportesDisponibles.map((deporte) => {
                  const seleccionado = deportesNivel[deporte] !== undefined;
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
                            {deportesNivel[deporte]}
                          </span>
                        )}
                      </div>

                      {/* Panel de nivel inline */}
                      {seleccionado && expandido && (
                        <div className="mt-1 bg-[#0f172a] rounded-lg p-3 border border-[#334155] space-y-2">
                          <p className="text-xs text-[#94a3b8] mb-2">Nivel en {deporte}:</p>
                          <div className="flex flex-col gap-1">
                            {NIVELES.map((n) => (
                              <button
                                key={n.value}
                                type="button"
                                onClick={() => { setNivel(deporte, n.value); setExpandedDeporte(null); }}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all
                                  ${deportesNivel[deporte] === n.value
                                    ? "bg-[#13ec80] text-[#0f172a] font-semibold"
                                    : "text-[#94a3b8] hover:bg-[#1e293b]"
                                  }`}
                              >
                                {deportesNivel[deporte] === n.value && <Check className="w-3 h-3" />}
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

              <p className="text-sm text-[#94a3b8]">
                {deportesSeleccionados.length === 0
                  ? "Selecciona al menos un deporte"
                  : `${deportesSeleccionados.length} deporte${deportesSeleccionados.length > 1 ? "s" : ""} seleccionado${deportesSeleccionados.length > 1 ? "s" : ""}`}
              </p>
            </div>

            {/* Resumen de selección */}
            {deportesSeleccionados.length > 0 && (
              <div className="bg-[#0f172a] rounded-lg p-4 border border-[#334155]">
                <p className="text-xs text-[#94a3b8] mb-3 uppercase tracking-wider">Tu selección</p>
                <div className="flex flex-wrap gap-2">
                  {deportesSeleccionados.map((d) => (
                    <span key={d} className="flex items-center gap-1 bg-[#13ec80]/10 text-[#13ec80] border border-[#13ec80]/30 rounded-full px-3 py-1 text-sm">
                      {d}
                      <span className="bg-[#13ec80] text-[#0f172a] rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
                        {deportesNivel[d]}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1 h-12" onClick={handleBack}>
                Atrás
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 bg-[#13ec80] text-[#102219] hover:bg-[#10d671]"
                disabled={loading || deportesSeleccionados.length === 0}
              >
                {loading ? "Creando perfil..." : "Finalizar"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}