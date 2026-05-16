/**
 * Archivo: context/AuthContext.tsx
 * Descripción: Contexto global de autenticación. Gestiona el estado del usuario,
 * la persistencia de la sesión mediante tokens y provee métodos de control de acceso.
 */

"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

/**
 * Interfaz que define la estructura de un usuario en el sistema.
 */
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

/**
 * Definición de los métodos y propiedades disponibles en el contexto.
 */
interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  register: (userData: Partial<User>) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook personalizado para acceder de forma sencilla al contexto de autenticación.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

/**
 * Proveedor del contexto que envuelve la aplicación (o parte de ella).
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Controla el estado inicial de hidratación

  // ── Restaurar sesión al arrancar ──────────────────────────────────────────
  /**
   * Efecto de inicialización: comprueba si existe un token en localStorage
   * y valida la identidad del usuario contra el backend al cargar la app.
   */
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
          // Mapeo dinámico: transformamos el rol del backend en un booleano isAdmin
          setUser({ ...data.user, isAdmin: data.user.rol === "ADMIN" });
        } else {
          // Si el token es inválido, limpiamos para evitar bucles de error
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

  /**
   * Establece el usuario en el estado global tras un login exitoso.
   */
  const login = (userData: User) => {
    setUser(userData);
  };

  /**
   * Simulación/Manejo local de registro inicial antes de persistir datos adicionales.
   */
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

  /**
   * Cierra la sesión eliminando el usuario del estado (el token se elimina manualmente en los componentes).
   */
  const logout = () => setUser(null);

  /**
   * Permite actualizar parcialmente los datos del usuario en caliente (ej: cambiar avatar o bio).
   */
  const updateUser = (userData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...userData } : prev));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, isAuthenticated: !!user }}>
      {/* Mientras se valida el token (loading), no renderizamos children.
          Esto evita el efecto de "flash" donde se ve el login un segundo 
          antes de redirigir al feed.
      */}
      {loading ? null : children}
    </AuthContext.Provider>
  );
};