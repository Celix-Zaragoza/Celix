"use client";

import { useRouter } from "next/navigation";
import { Button } from "./components/ui/button";
import { Activity, Users, Calendar, MapPin, TrendingUp, Heart } from "lucide-react";

export default function Page() {
  const router = useRouter();

  const features = [
    {
      icon: Activity,
      title: "Conecta con deportistas",
      description: "Encuentra personas que compartan tu pasión por el deporte en Zaragoza",
    },
    {
      icon: Calendar,
      title: "Eventos deportivos",
      description: "Descubre y participa en eventos deportivos cerca de ti",
    },
    {
      icon: MapPin,
      title: "Instalaciones cercanas",
      description: "Localiza las mejores instalaciones deportivas de la ciudad",
    },
    {
      icon: TrendingUp,
      title: "Estadísticas",
      description: "Sigue tu progreso y mejora tu rendimiento deportivo",
    },
    {
      icon: Users,
      title: "Comunidad activa",
      description: "Únete a una comunidad de deportistas comprometidos",
    },
    {
      icon: Heart,
      title: "Vida saludable",
      description: "Encuentra motivación y comparte tu estilo de vida saludable",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Header */}
        <header className="absolute top-0 w-full z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-[#13ec80] uppercase tracking-wide">CELIX</h1>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/auth/login")}
                  className="text-[#f1f5f9] hover:bg-[rgba(255,255,255,0.1)]"
                >
                  Iniciar sesión
                </Button>
                <Button
                  onClick={() => router.push("/auth/register")}
                  className="bg-[#13ec80] text-[#102219] hover:bg-[#10d671]"
                >
                  Registrarse
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#f1f5f9] mb-6">
                Tu red social
                <br />
                <span className="text-[#13ec80]">deportiva</span> en Zaragoza
              </h2>
              <p className="text-xl sm:text-2xl text-[#94a3b8] mb-10 max-w-3xl mx-auto">
                Conecta con deportistas, descubre eventos y encuentra las mejores instalaciones para practicar
                tu deporte favorito
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  onClick={() => router.push("/auth/register")}
                  className="bg-[#13ec80] text-[#102219] hover:bg-[#10d671] text-lg px-8 py-6 h-auto"
                >
                  Comenzar gratis
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push("/auth/login")}
                  className="border-2 border-[#13ec80] text-[#13ec80] hover:bg-[#13ec80] hover:text-[#102219] text-lg px-8 py-6 h-auto"
                >
                  Iniciar sesión
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#13ec80] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-[#13ec80] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-[#13ec80] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-[#1e293b] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-[#f1f5f9] mb-4">Todo lo que necesitas para tu vida deportiva</h3>
            <p className="text-xl text-[#94a3b8] max-w-2xl mx-auto">
              CELIX es la plataforma que conecta a la comunidad deportiva de Zaragoza
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-[#0f172a] rounded-2xl p-8 hover:shadow-lg transition-shadow border border-[rgba(148,163,184,0.2)]"
              >
                <div className="bg-[rgba(19,236,128,0.1)] w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-[#13ec80]" />
                </div>
                <h4 className="text-xl font-bold text-[#f1f5f9] mb-3">{feature.title}</h4>
                <p className="text-[#94a3b8]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#13ec80] to-[#10d671] py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-[#102219] mb-6">¿Listo para comenzar tu aventura deportiva?</h3>
          <p className="text-xl text-[#102219] mb-10 opacity-90">
            Únete a cientos de deportistas en Zaragoza y descubre nuevas formas de mantenerte activo
          </p>
          <Button
            size="lg"
            onClick={() => router.push("/auth/register")}
            className="bg-[#0f172a] text-[#13ec80] hover:bg-[#1e293b] text-lg px-10 py-6 h-auto"
          >
            Crear cuenta gratuita
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0f172a] text-[#f1f5f9] py-12 border-t border-[rgba(148,163,184,0.2)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h4 className="text-2xl font-bold mb-2 text-[#13ec80] uppercase tracking-wide">CELIX</h4>
            <p className="text-[#94a3b8]">La red social deportiva de Zaragoza</p>
            <p className="text-[#94a3b8] mt-6 text-sm opacity-70">© 2024 CELIX. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}