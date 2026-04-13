import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../../core/firebase/config';
import { createManualBlock, removeManualBlock } from '../../../../core/services/booking.service';
import { useToast } from '../../../context/ToastContext';
import { Clock, Lock } from 'lucide-react';

interface ManualBlocksManagerProps {
  barberId: string;
  schedule: { start: string; end: string; active: boolean };
}

export const ManualBlocksManager = ({ barberId, schedule }: ManualBlocksManagerProps) => {
  const { toast } = useToast();
  
  // Lógica nativa de fechas (Sin date-fns)
  const getNext7Days = () => {
    const days = [];
    const dayNames = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      days.push({
        formatted: `${yyyy}-${mm}-${dd}`,
        dayName: dayNames[d.getDay()],
        dayNumber: dd
      });
    }
    return days;
  };

  const nextDays = getNext7Days();
  const [selectedDate, setSelectedDate] = useState<string>(nextDays[0].formatted);
  const [blockedHours, setBlockedHours] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Generar horas de 1 en 1 hora, respetando el schedule
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = parseInt(schedule.start.split(':')[0]);
    const endHour = parseInt(schedule.end.split(':')[0]);
    
    for (let i = startHour; i < endHour; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Escuchar Firebase en tiempo real
  useEffect(() => {
    if (!barberId || !schedule.active) return;

    const locksRef = collection(db, "locks");
    const q = query(
      locksRef, 
      where("barberId", "==", barberId),
      where("date", "==", selectedDate),
      where("type", "==", "manual")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const locks = snapshot.docs.map(doc => doc.data().time);
      setBlockedHours(locks);
    });

    return () => unsubscribe();
  }, [barberId, selectedDate, schedule.active]);

  const toggleBlock = async (time: string) => {
    setLoading(true);
    try {
      if (blockedHours.includes(time)) {
        await removeManualBlock(barberId, selectedDate, time);
        toast.success(`Hora ${time} liberada.`);
      } else {
        await createManualBlock(barberId, selectedDate, time);
        toast.info(`Hora ${time} bloqueada.`);
      }
    } catch (error) {
      toast.error("Error al modificar la hora.");
    } finally {
      setLoading(false);
    }
  };

  if (!schedule.active) return null;

  return (
    <section className="bg-bg-card border border-white/5 rounded-xl p-6 shadow-lg mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><Lock size={20} /></div>
        <div>
          <h2 className="text-lg font-bold text-white">Bloqueos de Horas</h2>
          <p className="text-xs text-txt-muted">Bloquea horas específicas (Almuerzos/Descansos).</p>
        </div>
      </div>

      {/* Selector de Días (Nativo) */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
        {nextDays.map((dayData) => {
          const isSelected = dayData.formatted === selectedDate;
          
          return (
            <button
              key={dayData.formatted}
              onClick={() => setSelectedDate(dayData.formatted)}
              className={`shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-lg border transition-all duration-300 ${
                isSelected 
                  ? 'bg-amber-500 text-bg-main border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                  : 'bg-bg-main text-txt-muted border-white/10 hover:border-amber-500/50'
              }`}
            >
              <span className="text-[10px] uppercase font-bold">{dayData.dayName}</span>
              <span className="text-xl font-black">{dayData.dayNumber}</span>
            </button>
          );
        })}
      </div>

      {/* Cuadrícula de Horas (1 hora) */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {timeSlots.map((time) => {
          const isBlocked = blockedHours.includes(time);
          return (
            <button
              key={time}
              disabled={loading}
              onClick={() => toggleBlock(time)}
              className={`relative group flex items-center justify-center p-3 rounded-lg border text-sm font-bold transition-all duration-300 overflow-hidden ${
                isBlocked
                  ? 'bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20'
                  : 'bg-bg-main border-white/10 text-txt-main hover:border-amber-500 hover:text-amber-500'
              } disabled:opacity-50`}
            >
              <span className="relative z-10 flex items-center gap-2">
                {isBlocked ? <Lock size={14} className={loading ? "animate-spin" : "animate-pulse"} /> : <Clock size={14} />}
                {time}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};