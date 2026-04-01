import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import hero from '../assets/AJ-Hero.jpeg';

// Plantilla por defecto para que nunca cargue vacío
const defaultSchedule = [
  { day: 'Lunes', open: '10:00', close: '20:00', isClosed: false },
  { day: 'Martes', open: '10:00', close: '20:00', isClosed: false },
  { day: 'Miércoles', open: '10:00', close: '20:00', isClosed: false },
  { day: 'Jueves', open: '10:00', close: '20:00', isClosed: false },
  { day: 'Viernes', open: '10:00', close: '20:00', isClosed: false },
  { day: 'Sábado', open: '10:00', close: '18:00', isClosed: false },
  { day: 'Domingo', open: '10:00', close: '18:00', isClosed: true },
];

const Hero = () => {
  const [schedule, setSchedule] = useState<any[]>(defaultSchedule);
  const [todaySchedule, setTodaySchedule] = useState<any>(null);

  // Función para agrupar días consecutivos con el mismo horario
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

    // Formatea los nombres cortos
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

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden" id='hero'>
      
      {/* IMAGEN DE FONDO Y CAPA DE OSCURECIMIENTO */}
      <div className="absolute inset-x-0 bottom-0 top-20 z-0">
        <img 
          src={hero} 
          alt="Interior Barbería" 
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-bg-main/80"></div>
      </div>

      {/* CONTENIDO ESTRUCTURAL */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-18 md:pt-20 flex flex-col md:flex-row md:justify-between md:gap-12 text-center md:text-left">
        
        {/* LADO IZQUIERDO: TEXTO Y BOTONES */}
        <div className="w-full md:w-3/5 lg:w-2/3 mb-12 md:mb-0">
          <p className="text-gold font-bold tracking-[0.25em] mb-2 uppercase text-sm md:text-base animate-pulse">
            ESTILO CLÁSICO &bull; CORTES MODERNOS
          </p>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-txt-main mb-4 leading-tight tracking-tight">
            TU MEJOR <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-gold via-yellow-200 to-gold">
              VERSIÓN
            </span>
          </h1>

          <p className="text-txt-main text-lg md:text-xl mb-4 md:mb-10 max-w-2xl mx-auto md:mx-0 leading-relaxed font-light">
            Más que un corte, un ritual. Reserva tu experiencia con <br /> los mejores barberos de la zona.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center md:justify-start">
            <Link 
              to="/book" 
              className="bg-gold hover:bg-gold-hover text-bg-main font-bold py-4 px-10 rounded-sm transition-all transform hover:scale-105 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] uppercase tracking-wider text-sm md:text-base text-center"
            >
              Reservar Ahora
            </Link>
            <a  
              href="#servicios" 
              className="border border-white/20 hover:border-gold hover:text-gold text-txt-main font-bold py-4 px-10 rounded-sm transition-all uppercase tracking-wider backdrop-blur-sm text-sm md:text-base text-center"
            >
              Ver Servicios
            </a>
          </div>
        </div>

        {/* LADO DERECHO: BLOQUE DE HORARIOS DINÁMICO */}
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

      </div>
    </section>
  );
};

export default Hero;