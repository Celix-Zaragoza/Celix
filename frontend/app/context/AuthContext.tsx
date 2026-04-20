"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface User {
  id: string;
  alias: string;
  nombre: string;
  email: string;
  edad: number;
  zona: string;
  deportesNivel?: { deporte: string; nivel: number }[];
  avatar?: string;
  bio?: string;
  numSeguidores: number;
  numSiguiendo: number;
  publicaciones: number;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  register: (userData: Partial<User>) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // ← nuevo

  // ── Restaurar sesión al arrancar ──────────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/api/v1/users/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setUser({ ...data.user, isAdmin: data.user.rol === "ADMIN" });
        } else {
          // Token inválido o expirado — limpiar
          localStorage.removeItem("token");
        }
      } catch {
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const register = async (userData: Partial<User>): Promise<boolean> => {
    const newUser: User = {
      id: Math.random().toString(36).slice(2, 11),
      alias: userData.alias || "",
      nombre: userData.nombre || "",
      email: userData.email || "",
      edad: userData.edad || 0,
      zona: userData.zona || "",
      deportesNivel: userData.deportesNivel || [],
      avatar: userData.avatar,
      bio: userData.bio || "",
      numSeguidores: 0,
      numSiguiendo: 0,
      publicaciones: 0,
      isAdmin: false,
    };
    setUser(newUser);
    return true;
  };

  const logout = () => setUser(null);

  const updateUser = (userData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...userData } : prev));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, isAuthenticated: !!user }}>
      {/* Mientras restaura la sesión no renderiza nada para evitar el flash */}
      {loading ? null : children}
    </AuthContext.Provider>
  );
};