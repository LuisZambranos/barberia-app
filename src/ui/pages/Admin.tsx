import { useState } from "react";
import AdminBookings from "../components/admin/AdminBookings";
import AdminSchedule from "../components/admin/AdminSchedule";
import AdminBarbers from "../components/admin/AdminBarbers"; 
import AdminGallery from "../components/admin/AdminGallery";
import AdminClients from "../components/admin/AdminClients";

const Admin = () => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'schedule' | 'barbers' | 'gallery' | 'clients'>('bookings'); 

  return (
    <div className="min-h-screen bg-bg-main text-txt-main p-4 sm:p-8 pt-22 md:pt-24">
      
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gold">Panel de Administración</h1>
        <p className="text-txt-muted text-sm mt-1">Gestión global del sistema</p>
      </div>
      
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

        {/* PESTAÑA: CLIENTES (CRM) */}
        <button 
          onClick={() => setActiveTab('clients')}
          className={`px-4 py-2 font-bold rounded-t-md transition-all whitespace-nowrap ${
            activeTab === 'clients' 
              ? 'text-gold border-b-2 border-gold bg-white/5' 
              : 'text-txt-muted hover:text-white hover:bg-white/5'
          }`}
        >
          Clientes
        </button>
        
        {/* 3. NUEVA PESTAÑA: BARBEROS */}
        <button 
          onClick={() => setActiveTab('barbers')}
          className={`px-4 py-2 font-bold rounded-t-md transition-all whitespace-nowrap ${
            activeTab === 'barbers' 
              ? 'text-gold border-b-2 border-gold bg-white/5' 
              : 'text-txt-muted hover:text-white hover:bg-white/5'
          }`}
        >
          Barberos y Staff
        </button>

        {/* PESTAÑA: HORARIO GLOBAL */}
        <button 
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 font-bold rounded-t-md transition-all whitespace-nowrap ${
            activeTab === 'schedule' 
              ? 'text-gold border-b-2 border-gold bg-white/5' 
              : 'text-txt-muted hover:text-white hover:bg-white/5'
          }`}
        >
          Horario Global
        </button>

        {/* PESTAÑA: GALERÍA */}
        <button 
          onClick={() => setActiveTab('gallery')}
          className={`px-4 py-2 font-bold rounded-t-md transition-all whitespace-nowrap ${
            activeTab === 'gallery' 
              ? 'text-gold border-b-2 border-gold bg-white/5' 
              : 'text-txt-muted hover:text-white hover:bg-white/5'
          }`}
        >
          Galería
        </button>

      </div>

      {/* 4. RENDERIZADO CONDICIONAL (Fondo corregido para contraste) */}
      <div className="w-full max-w-[100vw] overflow-hidden pt-4">
        {activeTab === 'bookings' && <AdminBookings />}
        {activeTab === 'schedule' && <AdminSchedule />}
        {activeTab === 'barbers' && <AdminBarbers />} 
        {activeTab === 'gallery' && <AdminGallery />}
        {activeTab === 'clients' && <AdminClients />}
      </div>
    </div>
  );
};

export default Admin;