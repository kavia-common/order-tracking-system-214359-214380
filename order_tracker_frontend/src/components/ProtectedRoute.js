import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// PUBLIC_INTERFACE
export function ProtectedRoute({ children, requireAdmin = false }) {
  /** Route guard for authenticated (and optionally admin) pages. */
  const { isAuthed, role } = useAuth();

  if (!isAuthed) {
    return <Navigate to="/login" replace />;
  }
  if (requireAdmin && role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}
