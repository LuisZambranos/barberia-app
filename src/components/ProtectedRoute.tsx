import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();
  const location = useLocation(); // 1. Obtenemos la ubicación actual

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main text-gold animate-pulse">
      Cargando...
    </div>
  );

  // Si no hay usuario, mandarlo al Login, PERO guardando la ubicación en "state"
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;