// src/pages/Admin.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import AdminBookings from "../components/admin/AdminBookings";
import AdminSchedule from "../components/admin/AdminSchedule";

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'bookings' | 'schedule'>('bookings');

  const handleLogout = () => {
    auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-bg-main text-txt-main p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gold">Panel de Administración</h1>
        <button 
          onClick={handleLogout}
          className="bg-red-500/20 text-red-500 border border-red-500/50 px-4 py-2 rounded hover:bg-red-500 hover:text-white transition-all text-sm font-bold uppercase tracking-wider"
        >
          Cerrar Sesión
        </button>
      </div>
      
      {/* Navegación de Pestañas */}
      <div className="flex space-x-2 mb-6 border-b border-white/10 pb-2 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 font-bold rounded-t-md transition-all whitespace-nowrap ${
            activeTab === 'bookings' 
              ? 'text-gold border-b-2 border-gold bg-white/5' 
              : 'text-txt-muted hover:text-white hover:bg-white/5'
          }`}
        >
          Gestión de Citas
        </button>
        <button 
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 font-bold rounded-t-md transition-all whitespace-nowrap ${
            activeTab === 'schedule' 
              ? 'text-gold border-b-2 border-gold bg-white/5' 
              : 'text-txt-muted hover:text-white hover:bg-white/5'
          }`}
        >
          Horario Global (Home)
        </button>
      </div>

      {/* Área de Renderizado del Módulo */}
      <div className="bg-bg-card border border-white/10 p-4 sm:p-6 rounded-lg shadow-lg">
        {activeTab === 'bookings' ? <AdminBookings /> : <AdminSchedule />}
      </div>
    </div>
  );
};

export default Admin;