import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../core/firebase/config';

const defaultSchedule = [
  { day: 'Lunes', open: '10:00', close: '20:00', isClosed: false },
  { day: 'Martes', open: '10:00', close: '20:00', isClosed: false },
  { day: 'Miércoles', open: '10:00', close: '20:00', isClosed: false },
  { day: 'Jueves', open: '10:00', close: '20:00', isClosed: false },
  { day: 'Viernes', open: '10:00', close: '20:00', isClosed: false },
  { day: 'Sábado', open: '10:00', close: '18:00', isClosed: false },
  { day: 'Domingo', open: '10:00', close: '18:00', isClosed: true },
];

// Recibimos un prop 'variant' para saber si se dibuja estilo "Hero" (con el reloj grande) o estilo "Lista" (para el footer)
const ScheduleWidget = ({ variant = 'hero' }: { variant?: 'hero' | 'list' }) => {
  const [schedule, setSchedule] = useState<any[]>(defaultSchedule);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [todaySchedule, setTodaySchedule] = useState<any>(null);

  // Función para agrupar días consecutivos
  const groupSchedule = (scheduleData: any[]) => {
    if (!scheduleData || scheduleData.length === 0) return [];
    const grouped = [];
    let current = { ...scheduleData[0], startDay: scheduleData[0].day, endDay: scheduleData[0].day };

    for (let i = 1; i < scheduleData.length; i++) {
      const day = scheduleData[i];
      if (day.open === current.open && day.close === current.close && day.isClosed === current.isClosed) {
        current.endDay = day.day;
      } else {
        grouped.push({ ...current });
        current = { ...day, startDay: day.day, endDay: day.day };
      }
    }
    grouped.push({ ...current });

    return grouped.map(g => {
      const short = (d: string) => d.length > 6 ? d.substring(0, 3) : d; 
      return {
        label: g.startDay === g.endDay ? g.startDay : `${short(g.startDay)} - ${short(g.endDay)}`,
        time: g.isClosed ? 'Cerrado' : `${g.open} - ${g.close}`,
        isClosed: g.isClosed
      };
    });
  };

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const docRef = doc(db, 'config', 'general');
        const docSnap = await getDoc(docRef);
        let activeSchedule = defaultSchedule;

        if (docSnap.exists() && docSnap.data().schedule) {
          activeSchedule = docSnap.data().schedule;
          setSchedule(activeSchedule);
        }

        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const hoy = diasSemana[new Date().getDay()]; 
        setTodaySchedule(activeSchedule.find((d: any) => d.day === hoy));
        
      } catch (error) {
        console.error("Error cargando horario:", error);
      }
    };
    fetchSchedule();
  }, []);

  const groupedSchedule = groupSchedule(schedule);

  // --- VARIANTE 1: DISEÑO PARA EL HERO (Con cristal esmerilado y reloj grande) ---
  if (variant === 'hero') {
    return (
      <div className="w-full md:w-2/5 lg:w-1/2 bg-bg-main/70 backdrop-blur-sm p-6 sm:pt-0 rounded-xl border border-white/10 shadow-xl self-start md:self-center mt-8 md:mt-0">
        
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4 mt-0 sm:mt-6">
          <span className={`${todaySchedule?.isClosed ? 'text-red-500' : 'text-gold'} text-2xl`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <div className="text-left">
            <p className="text-sm font-bold text-txt-main mb-1">
              {todaySchedule?.isClosed ? 'Cerrado Hoy' : 'Abierto Hoy'}
            </p>
            <p className={`${todaySchedule?.isClosed ? 'text-red-500' : 'text-gold'} text-base font-semibold`}>
              {schedule.length > 0 
                ? (todaySchedule?.isClosed ? 'Te esperamos mañana' : `${todaySchedule?.open} AM - ${todaySchedule?.close} PM`) 
                : 'Cargando horario...'}
            </p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          {groupedSchedule.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-1">
              <span className={item.isClosed ? "text-txt-muted" : "text-txt-main"}>
                {item.label}
              </span>
              
              {item.isClosed ? (
                <span className="text-red-500 font-semibold text-xs uppercase tracking-widest">Cerrado</span>
              ) : (
                <span className="text-txt-main font-semibold">
                  {item.time}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- VARIANTE 2: DISEÑO PARA LOCATION/FOOTER (Lista plana) ---
  return (
    <div className="space-y-4 max-w-md">
      {groupedSchedule.map((item, index) => (
        <div key={index} className="flex justify-between items-center border-b border-white/10 pb-3">
          <span className="text-txt-muted text-xs uppercase tracking-[0.2em] font-bold">{item.label}</span>
          {item.isClosed ? (
             <span className="text-error font-black italic text-xs uppercase tracking-widest">Cerrado</span>
          ) : (
             <span className="text-txt-main font-mono font-bold text-sm tracking-tighter">{item.time}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default ScheduleWidget;