import { useState, useEffect } from 'react';
import { useBooking } from '../../context/BookingContext';
import { type Barber } from '../../../core/models/Barber';
import { getAllBarbers } from '../../../core/services/barber.service';

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const BarberSelection = () => {
  const { setStep, selectedBarber, setSelectedBarber } = useBooking();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBarbers = async () => {
      setLoading(true);
      try {
        const loadedBarbers = await getAllBarbers();
        
        // AQUI ESTÁ LA MAGIA: Filtramos solo los activos antes de mezclarlos
        const activeBarbers = loadedBarbers.filter(b => b.active);
        
        setBarbers(shuffleArray(activeBarbers));
      } catch (e) { 
        console.error("Error cargando barberos:", e); 
      } finally {
        setLoading(false);
      }
    };
    fetchBarbers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 animate-pulse">
        <p className="text-gold uppercase tracking-widest text-sm font-bold">Cargando Barberos...</p>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {barbers.map(b => {
          const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(b.name)}&background=1e293b&color=D4AF37&size=300`;
          const displayName = b.name.replace(/PRUEBA|Barbero 1/gi, '').trim() || "Profesional";
          
          return (
            <div 
              key={b.id} 
              onClick={() => setSelectedBarber(b)} 
              className={`p-4 border rounded-sm cursor-pointer transition-all duration-300 text-center flex flex-col items-center h-full justify-between hover:-translate-y-1 ${selectedBarber?.id === b.id ? 'border-gold bg-gold/5 shadow-[0_0_20px_rgba(212,175,55,0.3)] ring-1 ring-gold' : 'border-white/10 bg-white/2 hover:border-gold/50 hover:bg-white/5'}`}
            >
              <div className="mb-4 w-full aspect-square max-w-[120px] bg-bg-main border border-white/10 rounded-2xl mx-auto overflow-hidden shadow-lg">
                <img 
                  src={b.photoUrl || b.image || fallbackAvatar} 
                  alt={displayName} 
                  className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-110" 
                  style={{ imageRendering: '-webkit-optimize-contrast' }} 
                />
              </div>

              <div>
                <h3 className="font-bold text-sm md:text-lg mb-1 text-txt-main uppercase tracking-tight leading-tight">{displayName}</h3>
                <p className="text-txt-muted text-[10px] leading-tight hidden sm:block">{b.specialty}</p>
              </div>
              {selectedBarber?.id === b.id && (<div className="mt-3 w-3 h-3 bg-gold rounded-full animate-bounce"></div>)}
            </div>
          );
        })}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 border-t border-white/10 mt-6 pt-6 max-w-4xl mx-auto">
        <button onClick={() => setStep(3)} disabled={!selectedBarber} className="sm:w-3/4 bg-gold text-bg-main p-4 rounded-sm font-black text-sm uppercase tracking-[0.2em] disabled:opacity-30 shadow-xl shadow-gold/20 hover:bg-gold-hover transition-all">
          Ver Agenda de {selectedBarber?.name.replace(/PRUEBA|Barbero 1/gi, '').trim().split(' ')[0] || "Profesional"}
        </button>
        <button onClick={() => setStep(1)} className="sm:w-1/4 border border-white/20 p-4 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all">
          Regresar
        </button>
      </div>
    </div>
  );
};