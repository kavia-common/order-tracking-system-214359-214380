import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Api } from "../api/client";

const AuthContext = createContext(null);

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Provides auth state (token/user/role) and actions (login/signup/logout). */
  const [token, setToken] = useState(() => localStorage.getItem("ot_token") || "");
  const [user, setUser] = useState(() => safeJsonParse(localStorage.getItem("ot_user")) || null);
  const [role, setRole] = useState(() => localStorage.getItem("ot_role") || "customer"); // customer | admin
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) localStorage.setItem("ot_token", token);
    else localStorage.removeItem("ot_token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("ot_user", JSON.stringify(user));
    else localStorage.removeItem("ot_user");
  }, [user]);

  useEffect(() => {
    if (role) localStorage.setItem("ot_role", role);
  }, [role]);

  async function login(email, password) {
    setError("");
    setLoading(true);
    try {
      // When backend implements /auth/login, this will return token and user.
      const res = await Api.auth.login(email, password);
      if (res?.token) setToken(res.token);
      if (res?.user) setUser(res.user);

      // Fallback: if backend isn't ready, allow a demo mode login
      if (!res?.token) {
        setToken("demo-token");
        setUser({ email });
      }
      // Simple role heuristic for demo: emails containing "admin" become admins.
      const inferredRole = email.toLowerCase().includes("admin") ? "admin" : "customer";
      setRole(res?.role || inferredRole);

      return true;
    } catch (e) {
      setError(e.message || "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function signup(email, password) {
    setError("");
    setLoading(true);
    try {
      const res = await Api.auth.signup(email, password);
      if (res?.token) setToken(res.token);
      if (res?.user) setUser(res.user);

      // Demo fallback
      if (!res?.token) {
        setToken("demo-token");
        setUser({ email });
      }
      setRole(res?.role || "customer");
      return true;
    } catch (e) {
      setError(e.message || "Signup failed");
      return false;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setToken("");
    setUser(null);
    setRole("customer");
    setError("");
  }

  const value = useMemo(
    () => ({
      token,
      user,
      role,
      isAuthed: Boolean(token),
      loading,
      error,
      login,
      signup,
      logout,
      setRole,
    }),
    [token, user, role, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access auth context. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
