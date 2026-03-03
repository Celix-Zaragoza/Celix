"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Home, Search, PlusSquare, MessageCircle, User, Calendar, LogOut, Shield } from "lucide-react";
import { Button } from "../components/ui/button";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const navItems = [
    { icon: Home, label: "Inicio", path: "/app/feed" },
    { icon: Search, label: "Buscar", path: "/app/search" },
    { icon: PlusSquare, label: "Crear", path: "/app/create-post" },
    { icon: Calendar, label: "Eventos", path: "/app/events" },
    { icon: MessageCircle, label: "Mensajes", path: "/app/messages" },
    { icon: User, label: "Perfil", path: "/app/profile" },
  ];

  const isActive = (path: string) =>
    pathname === path || (path !== "/app/feed" && pathname?.startsWith(path));

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f172a] border-b border-[rgba(148,163,184,0.2)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1
                className="text-2xl font-bold text-[#13ec80] cursor-pointer uppercase tracking-wide"
                onClick={() => router.push("/app/feed")}
              >
                CELIX
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(item.path)}
                  className={[
                    "flex items-center gap-2 text-[#f1f5f9] hover:bg-[#1e293b] hover:text-[#13ec80]",
                    isActive(item.path) ? "text-[#13ec80]" : "",
                  ].join(" ")}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Button>
              ))}

              {user?.isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/admin")}
                  className="text-[#13ec80] hover:bg-[#1e293b]"
                >
                  Admin
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-400 hover:bg-[#1e293b] hover:text-red-300"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden lg:inline">Salir</span>
              </Button>
            </nav>

            {/* Mobile Header Buttons */}
            <div className="md:hidden flex items-center gap-1">
              {user?.isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/admin/publications")}
                  className="text-[#13ec80] hover:bg-[#1e293b]"
                  title="Panel Admin"
                >
                  <Shield className="w-5 h-5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/app/profile")}
                className="text-[#f1f5f9] hover:bg-[#1e293b]"
                title="Mi perfil"
              >
                <User className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-400 hover:bg-[#1e293b] hover:text-red-300"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0f172a] border-t border-[rgba(148,163,184,0.2)] z-50">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={[
                "flex flex-col items-center justify-center flex-1 h-full text-[#94a3b8] hover:text-[#13ec80] transition-colors",
                isActive(item.path) ? "text-[#13ec80]" : "",
              ].join(" ")}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}