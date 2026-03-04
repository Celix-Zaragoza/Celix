"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface User {
  id: string;
  alias: string;
  nombre: string;
  email: string;
  edad: number;
  zona: string;
  deportes: string[];
  nivelGeneral: number;
  avatar?: string;
  bio?: string;
  seguidores: number;
  siguiendo: number;
  publicaciones: number;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
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

  const login = async (email: string, password: string): Promise<boolean> => {
    if (email && password) {
      const mockUser: User = {
        id: "1",
        alias: "deportista_zaragoza",
        nombre: "Ana García",
        email,
        edad: 28,
        zona: "Centro",
        deportes: ["Fútbol", "Running", "Natación"],
        nivelGeneral: 75,
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
        bio: "🏃‍♀️ Amante del deporte y la vida saludable en Zaragoza",
        seguidores: 342,
        siguiendo: 189,
        publicaciones: 87,
        isAdmin: email.includes("admin"),
      };
      setUser(mockUser);
      return true;
    }
    return false;
  };

  const register = async (userData: Partial<User>): Promise<boolean> => {
    const newUser: User = {
      id: Math.random().toString(36).slice(2, 11),
      alias: userData.alias || "",
      nombre: userData.nombre || "",
      email: userData.email || "",
      edad: userData.edad || 0,
      zona: userData.zona || "",
      deportes: userData.deportes || [],
      nivelGeneral: userData.nivelGeneral || 50,
      avatar: userData.avatar,
      bio: userData.bio || "",
      seguidores: 0,
      siguiendo: 0,
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
      {children}
    </AuthContext.Provider>
  );
};