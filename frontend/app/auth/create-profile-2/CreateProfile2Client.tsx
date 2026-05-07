"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { deportesDisponibles } from "../../data/mockData";
import { toast } from "sonner";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

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

      const res = await fetch(`${API}/api/v1/users/me`, {
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#0d1f16" }}>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: "#13ec80" }}>
            <span className="text-sm font-black" style={{ color: "#0a1628" }}>⚡</span>
          </div>
          <span className="text-lg font-black tracking-widest" style={{ color: "#13ec80" }}>CELIX</span>
        </div>
        <span className="text-sm" style={{ color: "#94a3b8" }}>
          Paso <span style={{ color: "#13ec80" }}>2</span> de 2
        </span>
      </header>

      {/* Barra de progreso */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Datos Básicos</span>
          <span className="text-xs" style={{ color: "#94a3b8" }}>50% completado</span>
        </div>
        <div className="w-full h-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
          <div className="h-1 rounded-full transition-all duration-300" style={{ width: "100%", backgroundColor: "#13ec80" }} />
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 flex items-start justify-center px-6 pb-10">
        <div className="w-full max-w-2xl">
          <div
            className="rounded-2xl p-8"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Título */}
            <div className="mb-8">
              <h1 className="text-3xl font-black leading-tight mb-3" style={{ color: "#f1f5f9" }}>
                Casi listo
              </h1>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(148,163,184,0.8)" }}>
                Cuéntanos qué practicas y qué nivel tienes para conectarte con los mejores grupos en Zaragoza.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Deportes */}
              <div>
                <label
                  className="block text-xs font-bold mb-4 uppercase tracking-widest"
                  style={{ color: "#13ec80" }}
                >
                  Elige tus deportes
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {deportesDisponibles.map((deporte) => {
                    const seleccionado = deportesNivel[deporte] !== undefined;
                    const expandido = expandedDeporte === deporte;
                    return (
                      <div key={deporte} className="flex flex-col">
                        <div
                          className="relative flex items-center justify-between rounded-xl transition-all"
                          style={{
                            backgroundColor: seleccionado
                              ? "rgba(19,236,128,0.15)"
                              : "rgba(255,255,255,0.05)",
                            border: seleccionado
                              ? "1px solid rgba(19,236,128,0.5)"
                              : "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => toggleDeporte(deporte)}
                            className="flex-1 flex items-center gap-2 px-4 py-3 text-left"
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
                              {deportesNivel[deporte]}
                            </span>
                          )}
                        </div>

                        {/* Panel nivel */}
                        {seleccionado && expandido && (
                          <div
                            className="mt-1 rounded-xl p-3 space-y-1"
                            style={{
                              backgroundColor: "rgba(0,0,0,0.3)",
                              border: "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            <p className="text-xs mb-2" style={{ color: "#94a3b8" }}>
                              Nivel en {deporte}:
                            </p>
                            {NIVELES.map((n) => (
                              <button
                                key={n.value}
                                type="button"
                                onClick={() => { setNivel(deporte, n.value); setExpandedDeporte(null); }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
                                style={{
                                  backgroundColor: deportesNivel[deporte] === n.value
                                    ? "#13ec80"
                                    : "transparent",
                                  color: deportesNivel[deporte] === n.value
                                    ? "#0a1628"
                                    : "#94a3b8",
                                  fontWeight: deportesNivel[deporte] === n.value ? 600 : 400,
                                }}
                              >
                                {deportesNivel[deporte] === n.value && <Check className="w-3 h-3" />}
                                <span>{n.value} — {n.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs mt-3" style={{ color: "rgba(148,163,184,0.6)" }}>
                  {deportesSeleccionados.length === 0
                    ? "Selecciona al menos un deporte"
                    : `${deportesSeleccionados.length} deporte${deportesSeleccionados.length > 1 ? "s" : ""} seleccionado${deportesSeleccionados.length > 1 ? "s" : ""}`}
                </p>
              </div>

              {/* Resumen */}
              {deportesSeleccionados.length > 0 && (
                <div
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.2)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <p
                    className="text-xs mb-3 uppercase tracking-widest"
                    style={{ color: "#94a3b8" }}
                  >
                    Tu selección
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {deportesSeleccionados.map((d) => (
                      <span
                        key={d}
                        className="flex items-center gap-1 rounded-full px-3 py-1 text-sm"
                        style={{
                          backgroundColor: "rgba(19,236,128,0.1)",
                          color: "#13ec80",
                          border: "1px solid rgba(19,236,128,0.3)",
                        }}
                      >
                        {d}
                        <span
                          className="rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold"
                          style={{ backgroundColor: "#13ec80", color: "#0a1628" }}
                        >
                          {deportesNivel[d]}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-5 h-12 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.06)",
                    color: "#f1f5f9",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  ← Atrás
                </button>
                <button
                  type="submit"
                  disabled={loading || deportesSeleccionados.length === 0}
                  className="flex-1 h-12 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all"
                  style={{
                    backgroundColor: deportesSeleccionados.length === 0 ? "rgba(19,236,128,0.4)" : "#13ec80",
                    color: "#0a1628",
                    cursor: deportesSeleccionados.length === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Creando perfil..." : <>Guardar perfil y entrar <span>→</span></>}
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-xs mt-6" style={{ color: "rgba(148,163,184,0.4)" }}>
            © 2024 CELIX Zaragoza. Al entrar aceptas nuestros{" "}
            <a href="#" className="underline" style={{ color: "rgba(148,163,184,0.6)" }}>Términos de Servicio</a>.
          </p>
        </div>
      </div>
    </div>
  );
}