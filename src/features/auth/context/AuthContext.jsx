import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { login as loginRequest } from "../../../services/auth.api";
import {
  clearAuth as clearStoredAuth,
  getToken,
  getUser,
  setAuth,
} from "../utils/authStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email, password, rememberMe = true) => {
    const result = await loginRequest({ email, password });
    setAuth(result.token, result.user, rememberMe);
    setToken(result.token);
    setUser(result.user);
    return result;
  }, []);

  const demoLogin = useCallback((email, rememberMe = true) => {
    const normalizedEmail = email?.trim() || "demo@lumisec.local";
    const demoUser = {
      name: normalizedEmail.split("@")[0] || "Demo User",
      email: normalizedEmail,
      role: "admin",
    };
    const demoToken = `demo-token-${Date.now()}`;

    setAuth(demoToken, demoUser, rememberMe);
    setToken(demoToken);
    setUser(demoUser);

    return {
      user: demoUser,
      token: demoToken,
      message: "Demo session started",
    };
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isLoading,
      login,
      demoLogin,
      logout,
    }),
    [user, token, isLoading, login, demoLogin, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
