import { useState } from "react";
import { Settings, ArrowLeft } from "lucide-react";

// Importamos los componentes hijos
import AppointmentsView from "../components/barber/AppointmentsView";
import ConfigView from "../components/barber/ConfigView";

// Definimos los posibles estados de la vista
type ViewType = 'appointments' | 'config';

const BarberPage = () => {
  // Estado principal: controla qué se ve en la pantalla
  const [activeView, setActiveView] = useState<ViewType>('appointments');

  return (
    <div className="min-h-screen bg-bg-main text-txt-main p-4 md:p-8 font-sans">
      
      {/* --- ENCABEZADO DINÁMICO --- */}
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4 sticky top-0 bg-bg-main/80 backdrop-blur-md z-10">
        
        {/* Título y Subtítulo cambia según la vista */}
        <div className="animate-in fade-in duration-300">
          <h1 className="text-2xl md:text-3xl font-bold text-gold uppercase tracking-wider">
            {activeView === 'appointments' ? 'Mi Agenda' : 'Configuración'}
          </h1>
          <p className="text-xs md:text-sm text-txt-muted">
            {activeView === 'appointments' 
              ? `Hoy, ${new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}`
              : 'Ajusta tus preferencias y horarios'
            }
          </p>
        </div>
        
        {/* Botón de acción cambia (Engranaje <-> Flecha atrás) */}
        <button 
          onClick={() => setActiveView(activeView === 'appointments' ? 'config' : 'appointments')}
          className="bg-bg-card p-3 rounded-full border border-white/10 hover:border-gold hover:text-gold transition-all shadow-sm active:scale-95"
          aria-label={activeView === 'appointments' ? 'Ir a configuración' : 'Volver a la agenda'}
        >
          {activeView === 'appointments' ? (
            <Settings size={20} className="animate-in rotate-0 duration-300" />
          ) : (
            <ArrowLeft size={20} className="animate-in slide-in-from-right-2 duration-300" />
          )}
        </button>
      </div>

      {/* --- CONTENIDO DINÁMICO (Renderizado Condicional) --- */}
      {/* Si la vista es 'appointments', muestra AppointmentsView, si no, ConfigView */}
      <div className="min-h-[calc(100vh-150px)]">
        {activeView === 'appointments' ? <AppointmentsView /> : <ConfigView />}
      </div>

    </div>
  );
};

export default BarberPage;