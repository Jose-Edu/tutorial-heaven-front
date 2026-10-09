"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AuthApiError,
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  type AuthUser,
} from "@/lib/auth-api";

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setStatus("authenticated");
    } catch (reason) {
      setUser(null);
      if (reason instanceof AuthApiError && reason.status === 401) {
        setStatus("unauthenticated");
        return;
      }

      setStatus("error");
      setError(reason instanceof Error ? reason.message : "Não foi possível consultar a sessão.");
      throw reason;
    }
  }, []);

  useEffect(() => {
    window.localStorage.removeItem("tutorial-heaven-auth");
    const controller = new AbortController();

    getCurrentUser(controller.signal).then(
      (currentUser) => {
        setUser(currentUser);
        setStatus("authenticated");
      },
      (reason: unknown) => {
        if (controller.signal.aborted) return;
        setUser(null);
        if (reason instanceof AuthApiError && reason.status === 401) {
          setStatus("unauthenticated");
          return;
        }
        setStatus("error");
        setError(reason instanceof Error ? reason.message : "Não foi possível consultar a sessão.");
      },
    );

    return () => controller.abort();
  }, []);

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      await loginRequest(input);
      await refreshUser();
    },
    [refreshUser],
  );

  const register = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
      password_confirmation: string;
    }) => {
      await registerRequest(input);
      await refreshUser();
    },
    [refreshUser],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch (reason) {
      if (!(reason instanceof AuthApiError) || reason.status !== 401) throw reason;
    }
    setUser(null);
    setError(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({ user, status, error, login, register, logout, refreshUser }),
    [user, status, error, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return context;
}
