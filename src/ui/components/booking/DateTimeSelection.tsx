import { useEffect, useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { useBarberSchedule } from '../../hooks/useBarberSchedule';
import { createTemporalLock } from '../../../core/services/booking.service';
import { useToast } from '../../context/ToastContext';

export const DateTimeSelection = () => {
  const { 
    setStep, 
    selectedService, 
    selectedBarber, 
    selectedDate, 
    setSelectedDate, 
    selectedTime, 
    setSelectedTime 
  } = useBooking();

  const { toast } = useToast();
  const [isLocking, setIsLocking] = useState(false);

  // El hook ahora usa las variables del contexto central
  const { availableTimes, loadingSchedule } = useBarberSchedule(
    selectedBarber?.id, 
    selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(new Date());
    }
  }, [selectedDate, setSelectedDate]);

  // Obtenemos la fecha en string para el input type="date"
  const dateString = selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  const todayString = new Date().toISOString().split('T')[0];

  // Lógica de horas pasadas
  const now = new Date();
  const isToday = dateString === todayString;
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const validTimes = availableTimes.filter(time => {
    if (!isToday) return true;
    const [hours, minutes] = time.split(':').map(Number);
    return hours > currentHour || (hours === currentHour && minutes > currentMinute);
  });

  const currentTotal = selectedService?.price || 0; 

  const handleProceed = async () => {
    if (!selectedBarber || !selectedDate || !selectedTime) return;
    
    setIsLocking(true);
    
    // Formateamos la fecha para la base de datos
    const dbDateString = selectedDate.toISOString().split('T')[0];
    
    // Creamos el candado en Firebase
    const success = await createTemporalLock(selectedBarber.id, dbDateString, selectedTime);
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
                  const newDate = new Date(e.target.value);
                  newDate.setMinutes(newDate.getMinutes() + newDate.getTimezoneOffset());
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
            ) : validTimes.length > 0 ? (
                validTimes.map(time => {
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
                <div className="col-span-3 sm:col-span-4 animate-in fade-in duration-500">
                    <p className="text-red-400 text-xs border border-red-500/20 bg-red-500/10 p-3 rounded mb-6">
                        Las horas de este profesional ya pasaron o su agenda está llena para hoy.
                    </p>
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