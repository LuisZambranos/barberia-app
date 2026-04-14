import { useState, useEffect } from "react";
import { CalendarDays, Settings, Loader2, Archive } from "lucide-react"; // <--- Importamos Archive
import { useAuth } from "../context/AuthContext"; 
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../core/firebase/config";

import AppointmentsView from "../components/barber/AppointmentsView";
import ConfigView from "../components/barber/ConfigView";
import HistoryView from "../components/barber/HistoryView"; // <--- Importamos la nueva vista

// Agregamos 'history' a los tipos
type ViewType = 'appointments' | 'config' | 'history'; 

const BarberPage = () => {
  const { user } = useAuth(); 
  const [activeView, setActiveView] = useState<ViewType>('appointments');
  const [currentBarber, setCurrentBarber] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchBarberProfile = async () => {
      if (!user?.email) return;
      try {
        const q = query(collection(db, "barbers"), where("email", "==", user.email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setCurrentBarber({ id: doc.id, ...doc.data() });
        } else {
          console.error("Este usuario no tiene ficha en 'barbers'.");
        }
      } catch (error) {
        console.error("Error buscando perfil de barbero:", error);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchBarberProfile();
  }, [user]);

  const NavButton = ({ view, icon: Icon, label }: { view: ViewType, icon: any, label: string }) => {
    const isActive = activeView === view;
    return (
      <button
        onClick={() => setActiveView(view)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-bold uppercase tracking-wider text-xs md:text-sm w-full
          ${isActive 
            ? 'bg-gold text-bg-main shadow-lg shadow-gold/20 scale-[1.02]' 
            : 'bg-bg-card text-txt-muted hover:text-white hover:bg-white/5 border border-white/5'
          }`}
      >
        <Icon size={20} className={isActive ? 'animate-pulse' : ''} />
        <span>{label}</span>
      </button>
    );
  };

  if (loadingProfile) return <div className="min-h-screen bg-bg-main flex items-center justify-center text-gold"><Loader2 className="animate-spin mr-2"/> Cargando Perfil...</div>;
  if (!currentBarber) return <div className="min-h-screen bg-bg-main flex items-center justify-center text-white">Error: No se encontró tu perfil.</div>;

  return (
    <div className="min-h-screen bg-bg-main font-sans pt-20 flex flex-col md:flex-row">
      {/* SIDEBAR PC */}
      <aside className="hidden md:flex flex-col w-64 bg-bg-main/95 border-r border-white/10 fixed h-[calc(100vh-5rem)] top-20 left-0 z-30 p-6 backdrop-blur-md overflow-y-auto">
         <div className="mb-8">
            <h2 className="text-gold font-bold uppercase tracking-[0.2em] text-sm mb-1">Hola, {currentBarber.name.split(' ')[0]}</h2>
            <p className="text-txt-muted text-xs">Panel de Gestión</p>
         </div>
         <nav className="space-y-4 flex-1">
            <NavButton view="appointments" icon={CalendarDays} label="Mi Agenda" />
            <NavButton view="history" icon={Archive} label="Historial" /> {/* <--- Nuevo Botón */}
            <NavButton view="config" icon={Settings} label="Configuración" />
         </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 md:pl-64 w-full">
        {/* NAV MÓVIL */}
        <div className="md:hidden sticky top-20 z-30 bg-bg-main/95 backdrop-blur-md border-b border-white/10 p-4">
           <nav className="flex gap-2">
              <div className="flex-1"><NavButton view="appointments" icon={CalendarDays} label="Agenda" /></div>
              <div className="flex-1"><NavButton view="history" icon={Archive} label="Historial" /></div> {/* <--- Nuevo Botón */}
              <div className="flex-1"><NavButton view="config" icon={Settings} label="Config" /></div>
           </nav>
        </div>

        {/* HEADER DINÁMICO */}
        <div className="p-4 md:p-8 border-b border-white/10 bg-bg-main">
          <h1 className="text-2xl md:text-3xl font-bold text-gold uppercase tracking-wider animate-in fade-in duration-300">
            {activeView === 'appointments' && 'Mi Agenda Semanal'}
            {activeView === 'history' && 'Historial de Citas'}
            {activeView === 'config' && 'Ajustes del Perfil'}
          </h1>
        </div>

        {/* RENDERIZADO DE VISTAS */}
        <div className="p-4 md:p-8 min-h-[calc(100vh-250px)]">
          {activeView === 'appointments' && <AppointmentsView barberId={currentBarber.id} />}
          {activeView === 'history' && <HistoryView barberId={currentBarber.id} />}
          {activeView === 'config' && <ConfigView barberId={currentBarber.id} />}
        </div>
      </main>
    </div>
  );
};

export default BarberPage;