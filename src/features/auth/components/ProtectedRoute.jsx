import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AuthLoadingScreen() {
  return (
    <div className="login-body vh-100 d-flex align-items-center justify-content-center">
      <div className="text-center text-secondary">
        <div className="spinner-border text-primary mb-3" role="status" />
        <p className="mb-0">Restoring session...</p>
      </div>
    </div>
  );
}

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    const returnUrl = encodeURIComponent(
      location.pathname + location.search
    );
    return <Navigate to={`/login?returnUrl=${returnUrl}`} replace />;
  }

  return children;
}

export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    const params = new URLSearchParams(location.search);
    const returnUrl = params.get("returnUrl");
    const destination =
      returnUrl && returnUrl.startsWith("/") ? returnUrl : "/welcome";
    return <Navigate to={destination} replace />;
  }

  return children;
}
