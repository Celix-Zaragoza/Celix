/**
 * Archivo: auth/register/page.tsx
 * Descripción: Página de registro de nuevos usuarios. Gestiona la creación de cuenta,
 * validaciones básicas y la redirección al flujo de creación de perfil deportivo.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, User, Mail, Lock, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/**
 * Componente auxiliar para campos de entrada con soporte visual para errores y toggles de visibilidad.
 */
function InputField({
  id, name, type, placeholder, value, onChange, icon: Icon, toggle, showToggle, onToggle, hasError
}: {
  id: string; name: string; type: string; placeholder: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ElementType; toggle?: boolean; showToggle?: boolean; onToggle?: () => void;
  hasError?: boolean;
}) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: hasError ? "#ef4444" : "#4ade80" }} />
      <input
        id={id}
        name={name}
        type={toggle ? (showToggle ? "text" : "password") : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        className="w-full h-12 pl-10 pr-10 rounded-lg text-sm outline-none transition-all"
        style={{
          backgroundColor: "rgba(255,255,255,0.07)",
          border: `1px solid ${hasError ? "#ef4444" : "rgba(255,255,255,0.1)"}`,
          color: "#f1f5f9",
        }}
        onFocus={(e) => (e.target.style.borderColor = hasError ? "#ef4444" : "#13ec80")}
        onBlur={(e) => (e.target.style.borderColor = hasError ? "#ef4444" : "rgba(255,255,255,0.1)")}
      />
      {toggle && onToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2"
          style={{ color: "#94a3b8" }}
        >
          {showToggle ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}

/**
 * Página principal de registro.
 */
export default function Page() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    alias: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  /**
   * Actualiza el estado del formulario y limpia mensajes de error previos.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  /**
   * Maneja el envío del formulario al backend y redirige al primer paso del perfil.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password,
          alias: formData.alias || formData.nombre.toLowerCase().replace(/\s+/g, "_"),
        }),
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        localStorage.setItem("token", data.token);
        toast.success("¡Cuenta creada exitosamente!");
        
        const qs = new URLSearchParams({
          nombre: formData.nombre,
          email: formData.email,
          alias: data.user?.alias || formData.alias,
        }).toString();
        
        router.push(`/auth/create-profile-1?${qs}`);
      } else {
        const errorMsg = data.message || "Error al crear la cuenta";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor");
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#0d1f16" }}>
      {/* ── Panel izquierdo (desktop) ── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] relative overflow-hidden p-10" style={{ backgroundColor: "#0f2318" }}>
        <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(ellipse at 60% 60%, #13ec80 0%, transparent 70%)" }} />
        <div className="relative flex items-center gap-2 z-10">
          <img src="/logo.png" alt="CELIX" className="h-16 w-auto" />
          <span className="text-4xl font-black tracking-widest" style={{ color: "#f1f5f9" }}>CELIX</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-black leading-tight mb-6" style={{ color: "#f1f5f9" }}>
            ÚNETE A LA <span style={{ color: "#13ec80" }}>ÉLITE</span>
          </h1>
          <p className="text-base leading-relaxed mb-8" style={{ color: "rgba(241,245,249,0.65)" }}>
            Zaragoza ya tiene su red deportiva. Registra tus marcas y compite con los mejores.
          </p>
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
            <h2 className="text-3xl font-black mb-2" style={{ color: "#f1f5f9" }}>Crear cuenta</h2>
            <p className="text-sm" style={{ color: "#94a3b8" }}>Comienza tu viaje hoy mismo.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#f1f5f9" }}>Nombre completo</label>
              <InputField id="nombre" name="nombre" type="text" placeholder="Tu nombre" value={formData.nombre} onChange={handleChange} icon={User} hasError={!!error} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#f1f5f9" }}>Alias</label>
              <InputField id="alias" name="alias" type="text" placeholder="ej. marcos_fit" value={formData.alias} onChange={handleChange} icon={User} hasError={!!error} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#f1f5f9" }}>Correo electrónico</label>
              <InputField id="email" name="email" type="email" placeholder="correo@ejemplo.com" value={formData.email} onChange={handleChange} icon={Mail} hasError={!!error} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#f1f5f9" }}>Contraseña</label>
                <InputField id="password" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} icon={Lock} toggle showToggle={showPassword} onToggle={() => setShowPassword((v) => !v)} hasError={!!error} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#f1f5f9" }}>Confirmar contraseña</label>
                <InputField id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} icon={RefreshCw} toggle showToggle={showConfirmPassword} onToggle={() => setShowConfirmPassword((v) => !v)} hasError={!!error} />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-xs animate-in fade-in slide-in-from-top-1">
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
              {loading ? "Creando cuenta..." : <>Crear cuenta </>}
            </button>

            <p className="text-center text-sm pt-1" style={{ color: "#94a3b8" }}>
              ¿Ya tienes una cuenta?{" "}
              <button type="button" onClick={() => router.push("/auth/login")} className="font-semibold hover:underline" style={{ color: "#13ec80" }}>Iniciar sesión</button>
            </p>
          </form>
          
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