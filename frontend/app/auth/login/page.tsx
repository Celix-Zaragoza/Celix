"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Por favor, completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.ok) {
        localStorage.setItem("token", data.token);
        login({ ...data.user, isAdmin: data.user.rol === "ADMIN" });
        toast.success("¡Bienvenido a CELIX!");
        router.push("/app/feed");
      } else {
        toast.error("Credenciales incorrectas");
      }
    } catch {
      toast.error("Error al iniciar sesión");
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

      {/* ── Panel izquierdo (solo desktop) ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] relative overflow-hidden p-10"
        style={{ backgroundColor: "#0f2318" }}
      >
        {/* Fondo decorativo */}
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: "radial-gradient(ellipse at 60% 60%, #13ec80 0%, transparent 70%)" }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-2 z-10">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#13ec80" }}>
            <span className="text-lg font-black" style={{ color: "#0a1628" }}>⚡</span>
          </div>
          <span className="text-xl font-black tracking-widest" style={{ color: "#13ec80" }}>CELIX</span>
        </div>

        {/* Texto central */}
        <div className="relative z-10">
          <p className="text-sm font-semibold mb-3 uppercase tracking-widest" style={{ color: "#13ec80" }}>
            Red social deportiva
          </p>
          <h1 className="text-5xl font-black leading-tight mb-6" style={{ color: "#f1f5f9" }}>
            SUPERA TUS{" "}
            <span style={{ color: "#13ec80" }}>LÍMITES</span>
          </h1>
          <p className="text-base leading-relaxed mb-8" style={{ color: "rgba(241,245,249,0.65)" }}>
            Únete a la plataforma líder en optimización deportiva. Registra tus progresos y conecta con la comunidad en Zaragoza.
          </p>

          {/* Stats */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {["#13ec80", "#10d671", "#0ec060"].map((c, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: c, borderColor: "#0f2318", color: "#0a1628" }}
                >
                  {["C", "M", "J"][i]}
                </div>
              ))}
            </div>
            <p className="text-sm" style={{ color: "rgba(241,245,249,0.55)" }}>
              +2.000 atletas en Zaragoza ya entrenan con nosotros
            </p>
          </div>
        </div>

        {/* Balón */}
        <div className="relative z-10 flex justify-center">
          <div
            className="w-56 h-56 rounded-full flex items-center justify-center"
            style={{
              background: "radial-gradient(circle at 35% 35%, #b5651d, #3d1a00)",
              boxShadow: "0 0 60px rgba(19,236,128,0.15), inset 0 0 40px rgba(0,0,0,0.4)",
            }}
          >
            <span style={{ fontSize: "7rem" }}>🏀</span>
          </div>
        </div>

        {/* Volver */}
        <button
          onClick={() => router.push("/")}
          className="relative z-10 text-sm self-start hover:underline"
          style={{ color: "rgba(148,163,184,0.6)" }}
        >
          ← Volver al inicio
        </button>
      </div>

      {/* ── Panel derecho — Formulario ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">

          {/* Logo móvil */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#13ec80" }}>
              <span className="text-lg font-black" style={{ color: "#0a1628" }}>⚡</span>
            </div>
            <span className="text-xl font-black tracking-widest" style={{ color: "#13ec80" }}>CELIX</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-black mb-2" style={{ color: "#f1f5f9" }}>Iniciar Sesión</h2>
            <p className="text-sm" style={{ color: "#94a3b8" }}>Bienvenido de nuevo. Por favor, inicie sesión.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#f1f5f9" }}>
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#4ade80" }} />
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-12 pl-10 pr-4 rounded-lg text-sm outline-none transition-all"
                  style={inputBase}
                  onFocus={(e) => (e.target.style.borderColor = "#13ec80")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#f1f5f9" }}>
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#4ade80" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-12 pl-10 pr-10 rounded-lg text-sm outline-none transition-all"
                  style={inputBase}
                  onFocus={(e) => (e.target.style.borderColor = "#13ec80")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#94a3b8" }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Botón */}
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
              {loading ? "Iniciando sesión..." : <>Iniciar Sesión <span>→</span></>}
            </button>

            {/* Registro link */}
            <p className="text-center text-sm pt-1" style={{ color: "#94a3b8" }}>
              ¿No tienes una cuenta?{" "}
              <button
                type="button"
                onClick={() => router.push("/auth/register")}
                className="font-semibold hover:underline"
                style={{ color: "#13ec80" }}
              >
                Regístrate
              </button>
            </p>

            {/* Términos */}
            <p className="text-center text-xs leading-relaxed pt-2" style={{ color: "rgba(148,163,184,0.6)" }}>
              Al registrarte, confirmas que has leído y aceptas nuestra{" "}
              <a href="#" className="underline" style={{ color: "rgba(148,163,184,0.8)" }}>Política de Privacidad</a>
              {" "}y{" "}
              <a href="#" className="underline" style={{ color: "rgba(148,163,184,0.8)" }}>Términos de Servicio</a>.
              Datos procesados conforme a la normativa vigente en el municipio de Zaragoza, España.
            </p>
          </form>

          {/* Volver móvil */}
          <div className="mt-6 text-center lg:hidden">
            <button
              onClick={() => router.push("/")}
              className="text-sm"
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