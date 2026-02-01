import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Link } from 'react-router-dom';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface Barber {
  id: string;
  name: string;
  role: string;
}

const Booking = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [clientData, setClientData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sSnap = await getDocs(collection(db, "services"));
        setServices(sSnap.docs.map(d => ({ id: d.id, ...d.data() } as Service)));
        
        const bSnap = await getDocs(collection(db, "barbers"));
        setBarbers(bSnap.docs.map(d => ({ id: d.id, ...d.data() } as Barber)));
      } catch (e) { 
        console.error("Error cargando datos:", e); 
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedBarber || !selectedDate) return;

    const fetchOccupiedSlots = async () => {
      const q = query(
        collection(db, "appointments"),
        where("barberId", "==", selectedBarber.id),
        where("date", "==", selectedDate)
      );

      const querySnapshot = await getDocs(q);
      const occupied = querySnapshot.docs.map(doc => doc.data().time);
      setOccupiedSlots(occupied);
    };

    fetchOccupiedSlots();
  }, [selectedBarber, selectedDate]);

  const handleFinalizeBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedBarber || !selectedTime) return;

    setIsSubmitting(true);
    try {
      const newAppointment = {
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        barberId: selectedBarber.id,
        barberName: selectedBarber.name,
        date: selectedDate,
        time: selectedTime,
        price: selectedService.price,
        customerName: clientData.name,
        customerPhone: clientData.phone,
        customerEmail: clientData.email,
        status: 'pending', 
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "appointments"), newAppointment);
      setStep(5); // Saltamos a una pantalla de éxito
    } catch (error) {
      console.error("Error al guardar la reserva:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSlots = [];
  for (let h = 10; h < 20; h++) {
    timeSlots.push(`${h}:00`, `${h}:30`);
  }

  if (loading) return (
    <div className="min-h-screen bg-bg-main text-white flex items-center justify-center">
      <p className="animate-pulse text-gold text-xl font-bold tracking-widest uppercase">Cargando Experiencia...</p>
    </div>
  );

  return (
    // CAMBIO: bg-bg-main para mantener tus colores originales
    <div className="min-h-screen bg-bg-main text-white py-24 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* ENCABEZADO DE PASOS */}
        <div className="text-center mb-8 px-4">
          <h1 className="text-2xl md:text-5xl font-extrabold text-white mb-6 tracking-tight uppercase">
            Reserva tu <span className="text-gold">Turno</span>
          </h1>

          {/* Contenedor con Scroll Horizontal */}
          <div 
            id="stepper-container"
            className="flex items-center gap-4 overflow-x-auto pb-4 md:pb-2 md:justify-center whitespace-nowrap scrollbar-hide scroll-smooth"
          >
            {[
              { id: 1, label: "01 Servicio" },
              { id: 2, label: "02 Barbero" },
              { id: 3, label: "03 Fecha & Hora" },
              { id: 4, label: "04 Tus Datos" },
              { id: 5, label: "05 Confirmación" }
            ].map((s) => {
              // LÓGICA DE VALIDACIÓN: ¿Puede el usuario hacer clic aquí?
              const isAvailable = 
                (s.id === 1) ||
                (s.id === 2 && selectedService) ||
                (s.id === 3 && selectedService && selectedBarber) ||
                (s.id === 4 && selectedService && selectedBarber && selectedDate && selectedTime) ||
                (s.id === 5 && step === 5);

              return (
                <div 
                  key={s.id}
                  id={`step-link-${s.id}`} // ID para el auto-focus
                  onClick={() => isAvailable && setStep(s.id)}
                  className={`flex items-center gap-3 shrink-0 transition-all duration-300 
                    ${isAvailable ? "cursor-pointer opacity-100" : "cursor-not-allowed opacity-30"}`}
                >
                  <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest 
                    ${step === s.id ? "text-gold scale-110" : "text-txt-secondary"}`}>
                    {s.label}
                  </span>
                  {s.id !== 5 && <div className="h-px w-6 bg-white/10"></div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* PASO 1: SERVICIOS */}
        {step === 1 && (
          // Contenedor principal con espacio entre elementos
          <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {services.map(s => (
              <div 
                key={s.id} 
                onClick={() => setSelectedService(s)} 
                className={`p-6 border rounded-sm cursor-pointer transition-all duration-300 flex justify-between items-center
                  ${selectedService?.id === s.id 
                    ? 'border-gold bg-gold/5 shadow-[0_0_25px_rgba(212,175,55,0.2)] scale-[1.02]' 
                    : 'border-white/10 bg-white/2 hover:border-gold/50'}`}
              >
                <div>
                  <h3 className="text-xl font-bold mb-1">{s.name}</h3>
                  <p className="text-sm text-txt-secondary uppercase tracking-tighter">{s.duration} MINUTOS DE SESIÓN</p>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-gold font-black text-2xl">${s.price.toLocaleString()}</p>
                  {selectedService?.id === s.id && (
                    <span className="text-green-400 text-xs mt-1 font-semibold">
                      SELECCIONADO
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Contenedor para apilar los dos botones al final */}
            <div className="flex flex-col space-y-4 mt-8"> 
              <button 
                onClick={() => setStep(2)} 
                disabled={!selectedService} 
                className="w-full bg-gold text-bg-main p-4 rounded-sm font-black text-sm uppercase tracking-[0.2em] disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-gold-hover active:scale-95"
              >
                Siguiente: Elegir Barbero
              </button>
              
              {/* Botón de "Inicio" / Atrás */}
              <Link 
                to="/" 
                // Eliminamos el botón extra y aplicamos las clases directamente al Link
                // Agregamos 'flex items-center justify-center' para centrar el texto vertical y horizontalmente
                className="w-full border border-white/20 hover:border-gold hover:text-gold text-white font-bold py-4 px-6 rounded-sm transition-all uppercase tracking-wider backdrop-blur-sm flex items-center justify-center"
              >
                Inicio
              </Link>
            </div>
          </div>
        )}


        {/* PASO 2: BARBEROS */}
        {step === 2 && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {barbers.map(b => (
                <div 
                  key={b.id} 
                  onClick={() => setSelectedBarber(b)} 
                  className={`p-8 border rounded-sm cursor-pointer transition-all duration-300 text-center
                    ${selectedBarber?.id === b.id 
                      ? 'border-gold bg-gold/5 shadow-[0_0_25px_rgba(212,175,55,0.2)] scale-[1.05]' 
                      : 'border-white/10 bg-white/2 hover:border-gold/50'}`}
                >
                  <div className="w-24 h-24 bg-bg-main border border-white/10 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl shadow-inner">
                    💈
                  </div>
                  <h3 className="font-bold text-xl mb-1 text-white uppercase tracking-tight">{b.name}</h3>
                  <p className="text-xs text-gold font-bold uppercase tracking-widest mb-4">{b.role}</p>
                  <code className="text-[10px] text-white/20 block bg-black/20 py-1 rounded">ID: {b.id}</code>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 border-t border-white/10 mt-6 pt-6">
              <button 
                onClick={() => setStep(3)} 
                disabled={!selectedBarber} 
                className="sm:w-3/4 bg-gold text-bg-main p-4 rounded-sm font-black text-sm uppercase tracking-[0.2em] disabled:opacity-30 shadow-xl shadow-gold/20 hover:bg-gold-hover transition-all"
              >
                Ver Agenda
              </button>
              <button onClick={() => setStep(1)} className="sm:w-1/4 border border-white/20 p-4 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
              >
                Regresar
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: CALENDARIO Y HORAS */}
        {step === 3 && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            {/* Resumen Superior */}
            <div className="mb-8 p-4 bg-white/3 border-l-4 border-gold flex justify-between items-center">
              <div>
                <p className="text-[10px] text-gold font-bold uppercase tracking-widest">Resumen de Selección</p>
                
                {/* 👇 CAMBIO CLAVE AQUÍ: flex-col en móvil, md:flex-row en PC */}
                <div className="flex flex-col md:flex-row md:items-center">
                  
                  {/* El nombre del servicio: con margen abajo en móvil, sin margen en PC */}
                  <p className="text-lg font-bold mb-1 md:mb-0 md:mr-2">
                    {selectedService?.name}
                  </p>

                  {/* El nombre del barbero: la etiqueta 'con' queda en la segunda línea en móvil */}
                  <p className="text-lg font-bold">
                    <span className="text-txt-secondary font-light"> con</span> {selectedBarber?.name}
                  </p>
                </div>
                
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-gold">${selectedService?.price.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-8 items-start">
              {/* Columna Fecha (2/5) */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-sm font-bold text-gold uppercase tracking-[0.2em]">1. Elige la Fecha</h3>
                <div className="bg-white/2 p-6 rounded-sm border border-white/10">
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-bg-main border border-white/10 rounded-sm p-4 text-white text-lg focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>
              
              {/* Columna Horas (3/5) */}
              <div className="lg:col-span-3 space-y-4">
                <h3 className="text-sm font-bold text-gold uppercase tracking-[0.2em]">2. Horarios Disponibles</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {timeSlots.map(time => {
                    const isOccupied = occupiedSlots.includes(time);
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        disabled={isOccupied}
                        onClick={() => setSelectedTime(time)}
                        className={`py-3 rounded-sm font-bold text-xs transition-all duration-300 border
                          ${isOccupied 
                            ? 'border-red-900/30 bg-red-900/10 text-red-700 cursor-not-allowed opacity-40' 
                            : isSelected 
                              ? 'bg-gold text-bg-main border-gold shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-105' 
                              : 'border-white/10 bg-white/2 text-white hover:border-gold hover:text-gold'}`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* BOTONES FINALES */}
            <div className="flex flex-col sm:flex-row gap-4 border-t border-white/10 mt-6 pt-6">
              <button 
                disabled={!selectedTime}
                className="sm:w-3/4 bg-gold text-bg-main p-4 rounded-sm font-black text-sm uppercase tracking-[0.2em] disabled:opacity-30 shadow-xl shadow-gold/20 hover:bg-gold-hover transition-all"
                onClick={() => setStep(4)}
              >
                Ingresar Datos
              </button>
              <button onClick={() => setStep(2)} className="sm:w-1/4 border border-white/20 p-4 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
              >
                Regresar
              </button>
            </div>
          </div>
        )}

        {/* PASO 4: DATOS DEL CLIENTE */}
        {step === 4 && (
          <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-2xl font-bold text-gold text-center mb-8 uppercase tracking-widest">Tus Datos</h2>
            <form onSubmit={handleFinalizeBooking} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-gold uppercase tracking-[0.2em] mb-2">Nombre Completo</label>
                <input required type="text" value={clientData.name} onChange={(e) => setClientData({...clientData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-sm focus:border-gold outline-none transition-all" placeholder="Ej: Juan Pérez" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gold uppercase tracking-[0.2em] mb-2">Teléfono</label>
                <input required type="tel" value={clientData.phone} onChange={(e) => setClientData({...clientData, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-sm focus:border-gold outline-none transition-all" placeholder="+56 9 ..." />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gold uppercase tracking-[0.2em] mb-2">Email</label>
                <input required type="email" value={clientData.email} onChange={(e) => setClientData({...clientData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-sm focus:border-gold outline-none transition-all" placeholder="correo@ejemplo.com" />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 border-t border-white/10 mt-6 pt-6">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gold text-bg-main p-4 rounded-sm font-black text-sm uppercase tracking-[0.2em] hover:bg-gold-hover transition-all shadow-xl shadow-gold/20"
                >
                  {isSubmitting ? "Procesando..." : "Confirmar Reserva"}
                </button>
                <button onClick={() => setStep(3)} className="sm:w-1/4 border border-white/20 p-4 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
              >
                Regresar</button>
              </div>
            </form>
          </div>
        )}

        {/* PASO 5: ÉXITO Y REDIRECCIÓN */}
        {step === 5 && (
          <div className="text-center py-20 animate-in zoom-in-95 duration-700">
            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-[0_0_30px_rgba(34,197,94,0.2)]">
              ✓
            </div>
            <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter text-white">
              ¡Reserva Solicitada!
            </h2>
            <p className="text-txt-secondary max-w-sm mx-auto mb-10">
              Hemos registrado tu solicitud con éxito. Tu reserva está en estado <span className="text-gold font-bold italic">pendiente</span> hasta confirmar el pago.
            </p>
            <Link 
              to="/" 
              className="bg-gold text-bg-main py-4 px-10 rounded-sm font-bold uppercase tracking-widest hover:bg-gold-hover transition-all"
            >
              Volver al Inicio
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;