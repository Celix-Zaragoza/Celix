"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Eye, EyeOff } from "lucide-react";
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
      const data = await response.json();
      if (data.ok) {
        console.log("✅Esto devuelve el login", data);
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

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1e293b] rounded-2xl shadow-2xl p-8 border border-[rgba(148,163,184,0.2)]">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#13ec80] mb-2 uppercase tracking-wide">CELIX</h1>
            <p className="text-[#94a3b8]">Inicia sesión en tu cuenta</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-[#94a3b8]">Recordarme</span>
              </label>
              <a href="#" className="text-[#13ec80] hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg bg-[#13ec80] text-[#102219] hover:bg-[#10d671]"
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-[#334155] rounded-lg border border-[rgba(148,163,184,0.2)]">
            <p className="text-sm text-[#13ec80] mb-2 font-medium">💡 Credenciales de prueba:</p>
            <div className="text-sm text-[#f1f5f9] space-y-1">
              <p>Usuario: cualquier@email.com</p>
              <p>Admin: admin@celix.com</p>
              <p>Contraseña: cualquier texto</p>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-[#94a3b8]">
              ¿No tienes cuenta?{" "}
              <button
                type="button"
                onClick={() => router.push("/auth/register")}
                className="text-[#13ec80] hover:underline font-medium"
              >
                Regístrate aquí
              </button>
            </p>
          </div>

          {/* Back to home */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-[#94a3b8] hover:text-[#f1f5f9] text-sm"
            >
              ← Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}