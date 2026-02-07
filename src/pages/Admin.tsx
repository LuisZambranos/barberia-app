// src/pages/Admin.tsx
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";

const Admin = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-bg-main text-txt-main p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gold">Panel de Administración</h1>
        <button 
          onClick={handleLogout}
          className="bg-red-500/20 text-red-500 border border-red-500/50 px-4 py-2 rounded hover:bg-red-500 hover:text-white transition-all text-sm font-bold uppercase tracking-wider"
        >
          Cerrar Sesión
        </button>
      </div>
      
      <div className="bg-bg-card border border-white/10 p-6 rounded-lg">
        <p className="text-txt-muted">Bienvenido al área restringida. Aquí podrás gestionar citas y barberos.</p>
      </div>
    </div>
  );
};

export default Admin;