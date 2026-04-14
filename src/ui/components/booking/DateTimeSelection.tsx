import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../core/firebase/config';
import { useBooking } from '../../context/BookingContext';
import { useBarberSchedule } from '../../hooks/useBarberSchedule';
import { createTemporalLock } from '../../../core/services/booking.service';
import { useToast } from '../../context/ToastContext';
import { getLocalDateString } from '../../../core/utils/date.utils';
import type { Barber } from '../../../core/models/Barber';
import { Scissors } from 'lucide-react';

export const DateTimeSelection = () => {
  const { 
    setStep, 
    selectedService, 
    selectedBarber, 
    setSelectedBarber, // Necesitamos esto para poder cambiar de barbero desde las sugerencias
    selectedDate, 
    setSelectedDate, 
    selectedTime, 
    setSelectedTime 
  } = useBooking();

  const { toast } = useToast();
  const [isLocking, setIsLocking] = useState(false);
  const [otherBarbers, setOtherBarbers] = useState<Barber[]>([]);

  useEffect(() => {
    if (!selectedDate) {
      const parts = getLocalDateString().split('-');
      setSelectedDate(new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
    }
  }, [selectedDate, setSelectedDate]);

  const dateString = selectedDate 
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    : getLocalDateString();
    
  const todayString = getLocalDateString();

  const { availableTimes, loadingSchedule } = useBarberSchedule(
    selectedBarber?.id, 
    dateString
  );

  // --- NUEVA LÓGICA: CARGAR OTROS BARBEROS ---
  useEffect(() => {
      // Solo cargamos otros barberos si el actual NO tiene horas disponibles y no está cargando
      if (!loadingSchedule && availableTimes.length === 0) {
          const fetchOtherBarbers = async () => {
              try {
                  const q = query(collection(db, "barbers"), where("active", "==", true));
                  const querySnapshot = await getDocs(q);
                  const allActiveBarbers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Barber[];
                  
                  // Filtramos para quitar al barbero que ya tenemos seleccionado
                  const alternativeBarbers = allActiveBarbers.filter(b => b.id !== selectedBarber?.id);
                  setOtherBarbers(alternativeBarbers);
              } catch (error) {
                  console.error("Error trayendo otros barberos:", error);
              }
          };
          fetchOtherBarbers();
      }
  }, [availableTimes.length, loadingSchedule, selectedBarber?.id]);

  const currentTotal = selectedService?.price || 0; 

  const handleProceed = async () => {
    if (!selectedBarber || !selectedDate || !selectedTime) return;
    
    setIsLocking(true);
    
    const success = await createTemporalLock(selectedBarber.id, dateString, selectedTime);
    setIsLocking(false);

    if (success) {
      setStep(4); 
    } else {
      toast.error("¡Ups! Alguien acaba de reservar esta hora.");
    }
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-8 p-4 bg-white/3 border-l-4 border-gold flex justify-between items-center">
        <div>
          <p className="text-[10px] text-gold font-bold uppercase tracking-widest">Resumen</p>
          <div className="flex flex-col md:flex-row md:items-center">
            <p className="text-lg font-bold mb-1 md:mb-0 md:mr-2">{selectedService?.name}</p>
            <p className="text-lg font-bold"><span className="text-txt-secondary font-light"> con</span> {selectedBarber?.name.replace("PRUEBA", "")}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-gold">${currentTotal.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-gold uppercase tracking-[0.2em]">1. Elige la Fecha</h3>
          <div className="bg-white/2 p-6 rounded-sm border border-white/10">
            <input 
              type="date" 
              value={dateString}
              onChange={(e) => {
                  const parts = e.target.value.split('-');
                  const newDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                  setSelectedDate(newDate);
                  setSelectedTime(null); 
              }}
              min={todayString}
              className="w-full bg-bg-main border border-white/10 rounded-sm p-4 text-txt-main text-lg focus:outline-none focus:border-gold transition-colors"
            />
          </div>
        </div>
        
        <div className="lg:col-span-3 space-y-4">
          <h3 className="text-sm font-bold text-gold uppercase tracking-[0.2em]">2. Horarios Disponibles</h3>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {loadingSchedule ? (
                <p className="col-span-3 text-gold animate-pulse text-sm">Cargando disponibilidad...</p>
            ) : availableTimes.length > 0 ? (
                availableTimes.map(time => {
                  const isSelected = selectedTime === time;
                  return (
                    <button
                      key={time}
                      type="button" 
                      onClick={() => setSelectedTime(time)}
                      className={`py-3 rounded-sm font-bold text-xs transition-all duration-300 border
                        ${isSelected 
                          ? 'bg-gold text-bg-main border-gold shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-105' 
                          : 'border-white/10 bg-white/2 text-txt-main hover:border-gold hover:text-gold'}`}
                    >
                      {time}
                    </button>
                  );
                })
            ) : (
                <div className="col-span-3 sm:col-span-4 animate-in fade-in duration-500 space-y-6">
                    <p className="text-error text-xs border border-error/20 bg-error/10 p-3 rounded">
                        Las horas de este profesional ya pasaron o su agenda está llena para hoy.
                    </p>

                    {/* --- SUGERENCIAS DE OTROS BARBEROS --- */}
                    {otherBarbers.length > 0 && (
                        <div className="pt-4 border-t border-white/10">
                            <p className="text-xs text-txt-muted uppercase font-bold tracking-widest mb-4">
                                Otros profesionales disponibles
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {otherBarbers.map(barber => (
                                    <div 
                                        key={barber.id}
                                        onClick={() => {
                                            setSelectedBarber(barber);
                                            setSelectedTime(null); // Reseteamos la hora al cambiar
                                        }}
                                        className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:border-gold/50 hover:bg-white/10 transition-all group"
                                    >
                                        <img 
                                            src={barber.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(barber.name)}&background=1e293b&color=D4AF37`} 
                                            alt={barber.name}
                                            className="w-10 h-10 rounded-full object-cover grayscale-30 group-hover:grayscale-0 transition-all"
                                        />
                                        <div>
                                            <h4 className="text-sm font-bold text-white group-hover:text-gold transition-colors">{barber.name.replace("PRUEBA", "")}</h4>
                                            <div className="flex items-center gap-2 text-[10px] text-txt-muted mt-0.5">
                                                <span className="flex items-center gap-1"><Scissors size={10}/> {barber.specialty || 'Especialista'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 border-t border-white/10 mt-6 pt-6">
        <button 
          disabled={!selectedTime || isLocking}
          className="sm:w-3/4 bg-gold text-bg-main p-4 rounded-sm font-black text-sm uppercase tracking-[0.2em] disabled:opacity-30 shadow-xl shadow-gold/20 hover:bg-gold-hover transition-all flex justify-center items-center"
          onClick={handleProceed}
        >
          {isLocking ? "Asegurando hora..." : "Ingresar Datos"}
        </button>
        <button onClick={() => setStep(2)} className="sm:w-1/4 border border-white/20 p-4 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all">
          Regresar
        </button>
      </div>
    </div>
  );
};