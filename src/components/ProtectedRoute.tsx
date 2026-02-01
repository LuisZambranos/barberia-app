import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Props {
  allowedRoles?: ("client" | "barber" | "admin")[];
}

const ProtectedRoute = ({ allowedRoles }: Props) => {
  const { user, role, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-[#D4AF37]">Cargando...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Si tiene usuario pero no el rol adecuado, lo mandamos al home
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;