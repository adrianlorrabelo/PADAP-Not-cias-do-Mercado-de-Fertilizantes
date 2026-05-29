/* eslint-disable react-refresh/only-export-components */
import { createContext, useMemo, useState, type ReactNode } from "react";
import { mockCredentials, mockUsers } from "../data/mockUsers";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => { ok: boolean; message?: string };
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("padap.auth.session");
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      localStorage.removeItem("padap.auth.session");
      return null;
    }
  });

  const value = useMemo<AuthContextValue>(() => ({
    user,
    login(email, password) {
      const normalizedEmail = email.toLowerCase();
      const storedPassword = mockCredentials[normalizedEmail];
      const found = mockUsers.find((item) => item.email.toLowerCase() === normalizedEmail);
      if (!found || !storedPassword || storedPassword !== password) return { ok: false, message: "E-mail ou senha inválidos." };
      if (found.status === "Desativado") return { ok: false, message: "Usuário desativado. Procure o administrador." };
      const session = { ...found, lastAccess: new Date().toISOString() };
      setUser(session);
      localStorage.setItem("padap.auth.session", JSON.stringify(session));
      return { ok: true };
    },
    logout() {
      setUser(null);
      localStorage.removeItem("padap.auth.session");
    }
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
