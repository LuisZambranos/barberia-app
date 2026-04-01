import { useState } from "react";
import AdminBookings from "../components/admin/AdminBookings";
import AdminSchedule from "../components/admin/AdminSchedule";

const Admin = () => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'schedule'>('bookings');

  return (
    <div className="min-h-screen bg-bg-main text-txt-main p-4 sm:p-8 pt-24">
      {/* Header Limpio */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gold">Panel de Administración</h1>
        <p className="text-txt-muted text-sm mt-1">Gestión global del sistema</p>
      </div>
      
      {/* Navegación de Pestañas (Scrollable en móvil) */}
      <div className="flex space-x-2 mb-6 border-b border-white/10 pb-2 overflow-x-auto hide-scrollbar">
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

      {/* Área de Renderizado con fix para overflow en móvil */}
      <div className="bg-bg-card border border-white/10 p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-[100vw] overflow-hidden">
        {activeTab === 'bookings' ? <AdminBookings /> : <AdminSchedule />}
      </div>
    </div>
  );
};

export default Admin;