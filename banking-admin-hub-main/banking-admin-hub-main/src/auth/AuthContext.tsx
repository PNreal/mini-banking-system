import React, { createContext, useContext, useMemo, useState } from "react";
import { clearToken, getToken, setToken } from "./session";
import { loginAdmin } from "@/lib/api";

type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tokenState, setTokenState] = useState<string | null>(() => getToken());

  const value = useMemo<AuthContextValue>(() => {
    return {
      token: tokenState,
      isAuthenticated: !!tokenState,
      login: async (email: string, password: string) => {
        const res: any = await loginAdmin({ email, password });
        const token = res?.token || res?.accessToken || res?.jwt || res?.data?.token;
        if (!token) throw new Error("Không tìm thấy token đăng nhập.");
        setToken(token);
        setTokenState(token);
      },
      logout: () => {
        clearToken();
        setTokenState(null);
      },
    };
  }, [tokenState]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng bên trong AuthProvider");
  return ctx;
}


