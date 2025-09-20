import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "./LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireWorker?: boolean;
}

export const ProtectedRoute = ({ children, requireWorker = false }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (requireWorker && profile?.role !== 'worker') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};