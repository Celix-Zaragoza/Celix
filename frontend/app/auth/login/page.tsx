"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react"; // Añadido AlertCircle
import { toast } from "sonner";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Nuevo estado para errores

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Limpiar errores previos

    if (!email || !password) {
      setError("Por favor, completa todos los campos");
      toast.error("Campos incompletos");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }), // <--- 1. Verifica que estos nombres coincidan con el backend
      });

      const data = await response.json(); // <--- 2. Siempre parseamos el JSON

      if (response.ok && data.ok) {
        // ÉXITO
        localStorage.setItem("token", data.token);
        login({ ...data.user, isAdmin: data.user.rol === "ADMIN" });
        toast.success("¡Bienvenido!");
        router.push("/app/feed");
      } else {
        // ERROR DINÁMICO
        // Aquí data.message será "Credenciales incorrectas", "Cuenta bloqueada" o "invalid body"
        const errorMsg = data.message || "Error al iniciar sesión";
        setError(errorMsg); 
        toast.error(errorMsg);
      }
    } catch (err) {
      setError("Error de conexión");
      toast.error("Servidor no disponible");

    } finally {
      setLoading(false);
    }
  };

  const inputBase: React.CSSProperties = {
    backgroundColor: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#f1f5f9",
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#0d1f16" }}>
      {/* ── Panel izquierdo (desktop) - Sin cambios ── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] relative overflow-hidden p-10" style={{ backgroundColor: "#0f2318" }}>
          {/* ... (tu código de diseño permanece igual) ... */}
          <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(ellipse at 60% 60%, #13ec80 0%, transparent 70%)" }} />
          <div className="relative flex items-center gap-2 z-10">
            <img src="/logo.png" alt="CELIX" className="h-16 w-auto" />
            <span className="text-4xl font-black tracking-widest" style={{ color: "#f1f5f9" }}>CELIX</span>
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold mb-3 uppercase tracking-widest" style={{ color: "#13ec80" }}>Red social deportiva</p>
            <h1 className="text-5xl font-black leading-tight mb-6" style={{ color: "#f1f5f9" }}>SUPERA TUS <span style={{ color: "#13ec80" }}>LÍMITES</span></h1>
          </div>
          <div className="relative z-10 flex justify-center">
             <div className="w-56 h-56 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(circle at 35% 35%, #b5651d, #3d1a00)", boxShadow: "0 0 60px rgba(19,236,128,0.15), inset 0 0 40px rgba(0,0,0,0.4)" }}>
               <span style={{ fontSize: "10rem" }}>🏀</span>
             </div>
          </div>
          <button onClick={() => router.push("/")} className="relative z-10 text-sm self-start hover:underline" style={{ color: "rgba(148,163,184,0.6)" }}>← Volver al inicio</button>
      </div>

      {/* ── Panel derecho — Formulario ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-black mb-2" style={{ color: "#f1f5f9" }}>Iniciar Sesión</h2>
            <p className="text-sm" style={{ color: "#94a3b8" }}>Bienvenido de nuevo. Por favor, inicie sesión.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#f1f5f9" }}>Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#4ade80" }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-lg text-sm outline-none transition-all"
                  style={{...inputBase, borderColor: error ? "#ef4444" : "rgba(255,255,255,0.1)"}}
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#f1f5f9" }}>Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#4ade80" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-10 pr-10 rounded-lg text-sm outline-none transition-all"
                  style={{...inputBase, borderColor: error ? "#ef4444" : "rgba(255,255,255,0.1)"}}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* ── Mensaje de Error Visual ── */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-xs animate-in fade-in zoom-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-lg font-bold text-base flex items-center justify-center gap-2 transition-all mt-2"
              style={{
                backgroundColor: loading ? "#10d671" : "#13ec80",
                color: "#0a1628",
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? "Iniciando sesión..." : <>Iniciar Sesión </>}
            </button>

            {/* Resto de links y footer - Sin cambios */}
            <p className="text-center text-sm pt-1" style={{ color: "#94a3b8" }}>
              ¿No tienes una cuenta?{" "}
              <button type="button" onClick={() => router.push("/auth/register")} className="font-semibold hover:underline" style={{ color: "#13ec80" }}>Regístrate</button>
            </p>
          </form>
          {/* Volver al inicio — móvil */}
          <div className="mt-6 text-center lg:hidden">
            <button
              onClick={() => router.push("/")}
              className="text-sm hover:underline"
              style={{ color: "rgba(148,163,184,0.6)" }}
            >
              ← Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}