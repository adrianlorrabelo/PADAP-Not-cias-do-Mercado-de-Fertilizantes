/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";
import { mockCredentials, mockUsers } from "../data/mockUsers";
import { syncAllFromSupabase } from "../hooks/useSupabaseSync";
import { Roles } from "../types";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function mockLogin(email: string, password: string): { ok: boolean; message?: string; user?: User } {
  const normalizedEmail = email.toLowerCase();
  const storedPassword = mockCredentials[normalizedEmail];
  const found = mockUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!found || !storedPassword || storedPassword !== password)
    return { ok: false, message: "E-mail ou senha inválidos." };
  if (found.status === "Desativado")
    return { ok: false, message: "Usuário desativado. Procure o administrador." };
  return { ok: true, user: { ...found, lastAccess: new Date().toISOString() } };
}

function userFromSupabaseMeta(sbUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }): User | null {
  const meta = sbUser.user_metadata ?? {};
  const email = sbUser.email ?? "";
  const mock = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
  const role = (meta.role as User["role"]) ?? mock?.role ?? Roles.Viewer;
  if (!mock && !meta.name) return null;
  return {
    id: sbUser.id,
    name: (meta.name as string) ?? mock?.name ?? email,
    email,
    role,
    position: (meta.position as string) ?? mock?.position ?? "",
    status: "Ativo",
    lastAccess: new Date().toISOString(),
  };
}

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

  // Sync with Supabase session on mount and on auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const mapped = userFromSupabaseMeta(data.session.user);
        if (mapped) {
          setUser(mapped);
          localStorage.removeItem("padap.auth.session");
        }
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const mapped = userFromSupabaseMeta(session.user);
        if (mapped) {
          setUser(mapped);
          localStorage.removeItem("padap.auth.session");
        }
      } else if (!localStorage.getItem("padap.auth.session")) {
        setUser(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    async login(email, password) {
      // 1. Try Supabase Auth first
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error && data.user) {
          const mapped = userFromSupabaseMeta(data.user);
          if (mapped) {
            setUser(mapped);
            syncAllFromSupabase().catch(console.error);
            return { ok: true };
          }
        }
      } catch {
        // network error — fall through to mock
      }

      // 2. Fall back to mock credentials (demo mode)
      const result = mockLogin(email, password);
      if (result.ok && result.user) {
        setUser(result.user);
        localStorage.setItem("padap.auth.session", JSON.stringify(result.user));
        syncAllFromSupabase().catch(console.error);
        return { ok: true };
      }
      return { ok: false, message: result.message };
    },
    async logout() {
      setUser(null);
      localStorage.removeItem("padap.auth.session");
      await supabase.auth.signOut().catch(() => null);
    },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
