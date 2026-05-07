"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Users, FileText, Calendar, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "../components/ui/button";
import { Toaster } from "sonner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      router.replace("/app/feed");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user?.isAdmin) return null;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const navItems = [
    { icon: FileText, label: "Publicaciones", path: "/admin/publications" },
    { icon: Users, label: "Usuarios", path: "/admin/users" },
    { icon: Calendar, label: "Eventos", path: "/admin/events" },
  ];

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path);

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f172a] border-b border-[rgba(148,163,184,0.2)]">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/app/feed")}
                className="text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1e293b]"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl md:text-2xl font-bold text-[#f1f5f9]">Panel Admin</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(item.path)}
                  className={[
                    "text-[#94a3b8] hover:text-[#13ec80] hover:bg-[#1e293b] flex items-center gap-2",
                    isActive(item.path) ? "text-[#13ec80]" : "",
                  ].join(" ")}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-400 hover:bg-[#1e293b] hover:text-red-300"
              >
                <LogOut className="w-5 h-5" />
                <span>Salir</span>
              </Button>
            </nav>

            {/* Mobile Header Button - Logout */}
            <div className="md:hidden">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">{children}</main>

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
      <Toaster richColors position="top-right" /> 
    </div>
  );
}