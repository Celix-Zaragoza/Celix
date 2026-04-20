"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, User } from "lucide-react";
import { zonasZaragoza } from "../../data/mockData";
import { toast } from "sonner";

export default function CreateProfile1Client() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nombre = searchParams.get("nombre") ?? "";
  const email = searchParams.get("email") ?? "";
  const alias = searchParams.get("alias") ?? "";

  const [formData, setFormData] = useState({
    edad: "",
    zona: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.edad || !formData.zona) {
      toast.error("Por favor, completa todos los campos");
      return;
    }

    const edad = parseInt(formData.edad, 10);
    if (Number.isNaN(edad) || edad < 13 || edad > 120) {
      toast.error("Por favor, ingresa una edad válida");
      return;
    }

    const qs = new URLSearchParams({
      nombre, email, alias,
      edad: String(edad),
      zona: formData.zona,
    }).toString();

    router.push(`/auth/create-profile-2?${qs}`);
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(19,236,128,0.3)",
    color: "#f1f5f9",
    width: "100%",
    height: "48px",
    borderRadius: "8px",
    paddingLeft: "40px",
    paddingRight: "12px",
    fontSize: "14px",
    outline: "none",
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
          Paso <span style={{ color: "#13ec80" }}>1</span> de 2
        </span>
      </header>

      {/* Barra de progreso */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Datos Básicos</span>
          <span className="text-xs" style={{ color: "#94a3b8" }}>0% completado</span>
        </div>
        <div className="w-full h-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
          <div className="h-1 rounded-full" style={{ width: "50%", backgroundColor: "#13ec80" }} />
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 flex items-start justify-center px-6 pb-10">
        <div className="w-full max-w-lg">
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
                Antes de continuar, completa tu perfil deportivo
              </h1>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(148,163,184,0.8)" }}>
                Cuéntanos qué practicas y qué nivel tienes para conectarte con los mejores grupos en Zaragoza.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Edad */}
              <div>
                <label
                  className="block text-xs font-bold mb-2 uppercase tracking-widest"
                  style={{ color: "#13ec80" }}
                >
                  Edad
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#13ec80" }} />
                  <input
                    id="edad"
                    name="edad"
                    type="number"
                    placeholder="¿Cuántos años tienes?"
                    min="13"
                    max="120"
                    value={formData.edad}
                    onChange={handleChange}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#13ec80")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(19,236,128,0.3)")}
                  />
                </div>
              </div>

              {/* Zona */}
              <div>
                <label
                  className="block text-xs font-bold mb-3 uppercase tracking-widest"
                  style={{ color: "#13ec80" }}
                >
                  Zona de Zaragoza
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {zonasZaragoza.map((zona) => (
                    <button
                      key={zona}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, zona }))}
                      className="h-10 rounded-lg text-sm font-semibold transition-all"
                      style={{
                        backgroundColor: formData.zona === zona
                          ? "#13ec80"
                          : "rgba(255,255,255,0.06)",
                        color: formData.zona === zona ? "#0a1628" : "#f1f5f9",
                        border: formData.zona === zona
                          ? "1px solid #13ec80"
                          : "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      {zona.toUpperCase()}
                    </button>
                  ))}
                </div>
                <p className="text-xs mt-2" style={{ color: "rgba(148,163,184,0.6)" }}>
                  Esto nos ayudará a conectarte con deportistas cercanos
                </p>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/auth/register")}
                  className="flex items-center gap-2 px-5 h-12 rounded-lg text-sm font-semibold transition-all"
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
                  className="flex-1 h-12 rounded-lg font-bold text-base flex items-center justify-center gap-2 transition-all"
                  style={{ backgroundColor: "#13ec80", color: "#0a1628" }}
                >
                  Continuar →
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