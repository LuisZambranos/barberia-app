import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();
  const location = useLocation(); 

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main text-gold animate-pulse">
      Cargando...
    </div>
  );

  // Si no hay usuario, mandarlo al Login guardando la ubicación
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // REGLA DE SEGURIDAD ESTRICTA (Default Deny)
  // Si la ruta tiene roles permitidos, evaluamos estrictamente
  if (allowedRoles) {
    // Si el usuario no tiene rol, o su rol no está en la lista, lo rebotamos
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;