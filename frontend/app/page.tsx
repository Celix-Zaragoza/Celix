"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./components/ui/button";
import {
  Activity, Users, Calendar, MapPin, TrendingUp,
  MessageCircle, ChevronDown, Star, Zap, Shield,
} from "lucide-react";

const VERDE = "#13ec80";
const VERDE_DARK = "#10d671";
const FONDO = "#0a1628";
const FONDO2 = "#0f1f35";
const FONDO3 = "#132030";
const TEXTO = "#f1f5f9";
const TEXTO_MUTED = "#94a3b8";

const faqs = [
  {
    q: "¿Es CELIX gratuito para los usuarios?",
    a: "Sí, CELIX es completamente gratuito. Puedes registrarte, conectar con otros deportistas, descubrir eventos y acceder a todas las funcionalidades sin ningún coste.",
  },
  {
    q: "¿Qué deportes puedo practicar en la plataforma?",
    a: "CELIX incluye una amplia variedad de deportes: fútbol, baloncesto, pádel, running, ciclismo, natación, tenis y muchos más. Tú eliges cuáles son tus favoritos al crear tu perfil.",
  },
  {
    q: "¿Cómo funciona el sistema de match?",
    a: "Nuestro sistema analiza tu nivel, disponibilidad horaria y zona de Zaragoza para conectarte con deportistas afines. Cuanto más completo sea tu perfil, mejores serán las sugerencias.",
  },
  {
    q: "¿Los eventos son solo en Zaragoza?",
    a: "De momento sí. CELIX está diseñado específicamente para la comunidad deportiva de Zaragoza, integrando datos abiertos del Ayuntamiento para ofrecerte eventos e instalaciones locales.",
  },
];

const pasos = [
  {
    num: "01",
    titulo: "Regístrate",
    desc: "Crea tu perfil deportivo en menos de 2 minutos. Indica tus deportes favoritos y tu nivel.",
  },
  {
    num: "02",
    titulo: "Conecta",
    desc: "Encuentra deportistas con intereses similares en tu zona de Zaragoza y síguelos.",
  },
  {
    num: "03",
    titulo: "Juega",
    desc: "Apúntate a eventos, queda con otros usuarios y comparte tu actividad deportiva.",
  },
];

const features = [
  {
    icon: Zap,
    titulo: "Feed Impulsado por IA",
    desc: "Nuestro algoritmo aprende de tus preferencias para mostrarte el contenido más relevante de la comunidad deportiva de Zaragoza.",
  },
  {
    icon: MapPin,
    titulo: "Mapa Interactivo",
    desc: "Visualiza en tiempo real todas las instalaciones deportivas de la ciudad. Filtra por deporte y distancia.",
  },
  {
    icon: Calendar,
    titulo: "Open Data Zaragoza",
    desc: "Integramos los datos abiertos del Ayuntamiento para ofrecerte los eventos deportivos oficiales de la ciudad.",
  },
  {
    icon: MessageCircle,
    titulo: "Mensajería Integrada",
    desc: "Chatea directamente con otros deportistas para organizar quedadas y partidos.",
  },
  {
    icon: TrendingUp,
    titulo: "Estadísticas Personales",
    desc: "Visualiza tu evolución, número de publicaciones, likes recibidos y actividad deportiva.",
  },
  {
    icon: Shield,
    titulo: "Comunidad Moderada",
    desc: "Un equipo de administradores garantiza un entorno seguro y respetuoso para todos.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border-b cursor-pointer"
      style={{ borderColor: "rgba(148,163,184,0.15)" }}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between py-5 gap-4">
        <span className="font-semibold text-base" style={{ color: TEXTO }}>{q}</span>
        <ChevronDown
          className="w-5 h-5 flex-shrink-0 transition-transform duration-300"
          style={{ color: VERDE, transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </div>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? "200px" : "0px" }}
      >
        <p className="pb-5 leading-relaxed" style={{ color: TEXTO_MUTED }}>{a}</p>
      </div>
    </div>
  );
}

export default function Page() {
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ backgroundColor: FONDO, fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── HEADER ── */}
      <header className="fixed top-0 w-full z-50" style={{ backgroundColor: "rgba(10,22,40,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(19,236,128,0.1)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <span className="text-2xl font-black tracking-widest" style={{ color: VERDE }}>CELIX</span>
          <nav className="hidden md:flex items-center gap-8">
            {["Características", "Eventos", "Comunidad"].map((item) => (
              <a key={item} href="#" className="text-sm font-medium transition-colors hover:text-white" style={{ color: TEXTO_MUTED }}>{item}</a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => router.push("/auth/login")} className="text-sm font-medium" style={{ color: TEXTO }}>
              Iniciar sesión
            </Button>
            <Button onClick={() => router.push("/auth/register")} className="text-sm font-semibold px-5" style={{ backgroundColor: VERDE, color: "#0a1628" }}>
              Registrarse
            </Button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full" style={{ background: "radial-gradient(ellipse 60% 50% at 20% 50%, rgba(19,236,128,0.08) 0%, transparent 70%)" }} />
          <div className="absolute top-0 right-0 w-full h-full" style={{ background: "radial-gradient(ellipse 50% 60% at 80% 30%, rgba(19,236,128,0.06) 0%, transparent 70%)" }} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(rgba(19,236,128,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(19,236,128,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Texto */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ backgroundColor: "rgba(19,236,128,0.12)", color: VERDE, border: "1px solid rgba(19,236,128,0.25)" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: VERDE }} />
                Red social deportiva · Zaragoza
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6" style={{ color: TEXTO }}>
                Tu deporte,<br />
                <span style={{ color: VERDE }}>tu comunidad,</span><br />
                tu ritmo.
              </h1>
              <p className="text-lg mb-10 max-w-lg leading-relaxed" style={{ color: TEXTO_MUTED }}>
                Conecta con deportistas amateurs en Zaragoza. Descubre eventos, encuentra instalaciones y comparte tu pasión por el deporte.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button
                  size="lg"
                  onClick={() => router.push("/auth/register")}
                  className="font-bold text-base px-8 py-6 h-auto rounded-xl"
                  style={{ backgroundColor: VERDE, color: "#0a1628" }}
                >
                  Empieza gratis
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push("/auth/login")}
                  className="font-semibold text-base px-8 py-6 h-auto rounded-xl"
                  style={{ borderColor: "rgba(148,163,184,0.3)", color: TEXTO, backgroundColor: "transparent" }}
                >
                  Iniciar sesión
                </Button>
              </div>
              {/* Stats */}
              <div className="flex items-center gap-8">
                {[
                  { val: "500+", label: "Deportistas" },
                  { val: "120+", label: "Eventos" },
                  { val: "40+", label: "Instalaciones" },
                ].map(({ val, label }) => (
                  <div key={label}>
                    <p className="text-2xl font-black" style={{ color: VERDE }}>{val}</p>
                    <p className="text-xs font-medium" style={{ color: TEXTO_MUTED }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Imagen / mockup */}
            <div className="relative hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(19,236,128,0.2)", boxShadow: "0 0 80px rgba(19,236,128,0.1)" }}>
                <img
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=700&q=80"
                  alt="Deportistas en Zaragoza"
                  className="w-full h-80 object-cover"
                  style={{ filter: "brightness(0.7) saturate(1.1)" }}
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(19,236,128,0.15) 0%, transparent 60%)" }} />
              </div>
              {/* Card flotante */}
              <div className="absolute -bottom-6 -left-6 rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: FONDO2, border: "1px solid rgba(19,236,128,0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(19,236,128,0.15)" }}>
                  <Star className="w-5 h-5" style={{ color: VERDE }} />
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: TEXTO }}>Evento cercano</p>
                  <p className="text-xs" style={{ color: TEXTO_MUTED }}>Maratón Zaragoza · Dom 9:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3 PASOS ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: FONDO2 }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: VERDE }}>Así de fácil</p>
            <h2 className="text-4xl font-black mb-4" style={{ color: TEXTO }}>Tres pasos para empezar</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: TEXTO_MUTED }}>
              En menos de 5 minutos estarás conectado con la comunidad deportiva de Zaragoza
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Línea conectora */}
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-px" style={{ backgroundColor: "rgba(19,236,128,0.2)" }} />
            {pasos.map((paso) => (
              <div key={paso.num} className="relative text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl text-3xl font-black mb-6 relative" style={{ backgroundColor: "rgba(19,236,128,0.1)", color: VERDE, border: "1px solid rgba(19,236,128,0.25)" }}>
                  {paso.num}
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: TEXTO }}>{paso.titulo}</h3>
                <p className="leading-relaxed" style={{ color: TEXTO_MUTED }}>{paso.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: FONDO }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: VERDE }}>Diseñado para ti</p>
              <h2 className="text-4xl font-black leading-tight" style={{ color: TEXTO }}>
                Diseñado para la<br />
                <span style={{ color: VERDE }}>experiencia deportiva</span><br />
                definitiva
              </h2>
            </div>
            <p className="text-lg leading-relaxed" style={{ color: TEXTO_MUTED }}>
              CELIX combina tecnología moderna con datos abiertos del Ayuntamiento de Zaragoza para darte la mejor experiencia deportiva social de la ciudad.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 group transition-all duration-300 hover:-translate-y-1"
                style={{ backgroundColor: FONDO3, border: "1px solid rgba(148,163,184,0.1)" }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors" style={{ backgroundColor: "rgba(19,236,128,0.1)" }}>
                  <f.icon className="w-6 h-6" style={{ color: VERDE }} />
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: TEXTO }}>{f.titulo}</h3>
                <p className="text-sm leading-relaxed" style={{ color: TEXTO_MUTED }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA MÓVIL ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: FONDO2 }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: VERDE }}>Siempre contigo</p>
              <h2 className="text-4xl font-black mb-6 leading-tight" style={{ color: TEXTO }}>
                Lleva CELIX en<br />tu bolsillo
              </h2>
              <p className="text-lg mb-8 leading-relaxed" style={{ color: TEXTO_MUTED }}>
                La aplicación está optimizada para móvil para que puedas estar conectado con la comunidad deportiva de Zaragoza desde cualquier lugar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-3 px-5 py-3 rounded-xl" style={{ backgroundColor: "rgba(19,236,128,0.1)", border: "1px solid rgba(19,236,128,0.2)" }}>
                  <Activity className="w-5 h-5" style={{ color: VERDE }} />
                  <span className="font-semibold text-sm" style={{ color: TEXTO }}>Diseño mobile-first</span>
                </div>
                <div className="flex items-center gap-3 px-5 py-3 rounded-xl" style={{ backgroundColor: "rgba(19,236,128,0.1)", border: "1px solid rgba(19,236,128,0.2)" }}>
                  <Zap className="w-5 h-5" style={{ color: VERDE }} />
                  <span className="font-semibold text-sm" style={{ color: TEXTO }}>Tiempo real</span>
                </div>
              </div>
            </div>
            {/* Phone mockup */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="w-56 h-96 rounded-3xl flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: FONDO3, border: "2px solid rgba(19,236,128,0.3)", boxShadow: "0 0 60px rgba(19,236,128,0.15)" }}>
                  <div className="absolute top-0 left-0 right-0 h-8 rounded-t-3xl" style={{ backgroundColor: "rgba(19,236,128,0.1)" }} />
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-1.5 rounded-full" style={{ backgroundColor: "rgba(19,236,128,0.4)" }} />
                  <div className="text-center px-4">
                    <p className="text-4xl font-black mb-2" style={{ color: VERDE }}>CELIX</p>
                    <p className="text-xs" style={{ color: TEXTO_MUTED }}>Tu deporte, tu comunidad</p>
                  </div>
                  <div className="absolute bottom-6 left-4 right-4 py-3 rounded-xl text-center text-sm font-bold" style={{ backgroundColor: VERDE, color: "#0a1628" }}>
                    Abrir app →
                  </div>
                </div>
                {/* Glow */}
                <div className="absolute -inset-4 rounded-3xl blur-2xl -z-10 opacity-20" style={{ backgroundColor: VERDE }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: FONDO }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: VERDE }}>FAQ</p>
            <h2 className="text-4xl font-black" style={{ color: TEXTO }}>Preguntas Frecuentes</h2>
          </div>
          <div>
            {faqs.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${VERDE} 0%, ${VERDE_DARK} 100%)` }}>
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-4xl sm:text-5xl font-black mb-6" style={{ color: "#0a1628" }}>
            ¿Listo para unirte a la comunidad?
          </h2>
          <p className="text-xl mb-10 opacity-80" style={{ color: "#0a1628" }}>
            Únete a cientos de deportistas en Zaragoza y descubre nuevas formas de mantenerte activo
          </p>
          <Button
            size="lg"
            onClick={() => router.push("/auth/register")}
            className="font-bold text-base px-10 py-6 h-auto rounded-xl"
            style={{ backgroundColor: "#0a1628", color: VERDE }}
          >
            Crear cuenta gratuita
          </Button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: FONDO, borderTop: "1px solid rgba(148,163,184,0.1)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <p className="text-2xl font-black tracking-widest mb-3" style={{ color: VERDE }}>CELIX</p>
              <p className="text-sm leading-relaxed" style={{ color: TEXTO_MUTED }}>La red social deportiva de Zaragoza. Tu deporte, tu comunidad, tu ritmo.</p>
            </div>
            {[
              { titulo: "Producto", links: ["Características", "Eventos", "Instalaciones", "Comunidad"] },
              { titulo: "Legal", links: ["Privacidad", "Términos", "Cookies"] },
              { titulo: "Soporte", links: ["Ayuda", "Contacto", "FAQ"] },
            ].map(({ titulo, links }) => (
              <div key={titulo}>
                <p className="font-bold text-sm mb-4" style={{ color: TEXTO }}>{titulo}</p>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm transition-colors hover:text-white" style={{ color: TEXTO_MUTED }}>{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 text-center text-sm" style={{ color: TEXTO_MUTED, borderTop: "1px solid rgba(148,163,184,0.1)" }}>
            © 2026 CELIX. Todos los derechos reservados. · Hecho con ❤️ en Zaragoza
          </div>
        </div>
      </footer>
    </div>
  );
}