import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "./LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireModerator?: boolean;
}

export const ProtectedRoute = ({ children, requireModerator = false }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, hasPermission } = useAuth();

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

  if (requireModerator && !hasPermission('moderator')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};