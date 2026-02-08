import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Link } from 'react-router-dom';

// IMPORTAMOS EL SERVICIO NUEVO
import { createAppointment } from '../services/booking.service';

// IMPORTAMOS TIPOS
import type { Service } from '../models/Service';
import type { Barber } from '../models/Barber';

// IMÁGENES LOCALES
import barbero1 from "../assets/barbero1.jpg";
import barbero2 from "../assets/barbero2.jpg";
import barbero3 from "../assets/barbero3.jpg";
import barbero4 from "../assets/barbero4.jpg";

const BARBER_PHOTOS: Record<string, string> = {
  "A91rn25WwfZq2hPYvEnZ": barbero1,
  "DmpODFjBiIuxBRaIyEwk": barbero2, 
  "dDyRG44j2Mt4nJSfZXu9": barbero3,
  "yQgREMm4PyY7kRqUWvlC": barbero4 
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

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
  const [successId, setSuccessId] = useState<string | null>(null); // ID del ticket generado
  
  const [clientData, setClientData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  // CARGA INICIAL
  useEffect(() => {
    const fetchData = async () => {
      try {
        const sSnap = await getDocs(collection(db, "services"));
        setServices(sSnap.docs.map(d => ({ id: d.id, ...d.data() } as Service)));
        
        const bSnap = await getDocs(collection(db, "barbers"));
        let loadedBarbers = bSnap.docs.map(d => ({ id: d.id, ...d.data() } as Barber));
        setBarbers(shuffleArray(loadedBarbers));

      } catch (e) { 
        console.error("Error cargando datos:", e); 
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // VERIFICAR HORAS OCUPADAS
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

  // --- NUEVA LÓGICA DE ENVÍO USANDO EL SERVICIO ---
  const handleFinalizeBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedBarber || !selectedTime) return;

    setIsSubmitting(true);
    try {
      // LLAMAMOS AL SERVICIO (BACKEND)
      const ticketId = await createAppointment({
        service: selectedService,
        barber: selectedBarber,
        date: selectedDate,
        time: selectedTime,
        client: clientData
      });

      // SI TODO SALE BIEN:
      setSuccessId(ticketId);
      setStep(5);
    } catch (error) {
      console.error("Error al guardar la reserva:", error);
      alert("Hubo un error al procesar tu reserva. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSlots = [];
  for (let h = 10; h < 20; h++) {
    timeSlots.push(`${h}:00`, `${h}:30`);
  }

  if (loading) return (
    <div className="min-h-screen bg-bg-main text-txt-main flex items-center justify-center">
      <p className="animate-pulse text-gold text-xl font-bold tracking-widest uppercase">Cargando Experiencia...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-main text-txt-main py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto"> 
        
        {/* ENCABEZADO DE PASOS */}
        <div className="text-center mb-8 px-4">
          <h1 className="text-2xl md:text-5xl font-extrabold text-txt-main mb-6 tracking-tight uppercase">
            Reserva tu <span className="text-gold">Turno</span>
          </h1>

          <div id="stepper-container" className="flex items-center gap-4 overflow-x-auto pb-4 md:pb-2 md:justify-center whitespace-nowrap scrollbar-hide scroll-smooth">
            {[
              { id: 1, label: "01 Servicio" },
              { id: 2, label: "02 Barbero" },
              { id: 3, label: "03 Fecha & Hora" },
              { id: 4, label: "04 Tus Datos" },
              { id: 5, label: "05 Confirmación" }
            ].map((s) => {
              const isAvailable = 
                (s.id === 1) ||
                (s.id === 2 && selectedService) ||
                (s.id === 3 && selectedService && selectedBarber) ||
                (s.id === 4 && selectedService && selectedBarber && selectedDate && selectedTime) ||
                (s.id === 5 && step === 5);

              return (
                <div 
                  key={s.id}
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
                    <span className="text-green-400 text-xs mt-1 font-semibold">SELECCIONADO</span>
                  )}
                </div>
              </div>
            ))}

            <div className="flex flex-col space-y-4 mt-8"> 
              <button 
                onClick={() => setStep(2)} 
                disabled={!selectedService} 
                className="w-full bg-gold text-bg-main p-4 rounded-sm font-black text-sm uppercase tracking-[0.2em] disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-gold-hover active:scale-95"
              >
                Siguiente: Elegir Barbero
              </button>
              <Link to="/" className="w-full border border-white/20 hover:border-gold hover:text-gold text-txt-main font-bold py-4 px-6 rounded-sm transition-all uppercase tracking-wider backdrop-blur-sm flex items-center justify-center">
                Inicio
              </Link>
            </div>
          </div>
        )}

        {/* PASO 2: BARBEROS */}
        {step === 2 && (
          <div className="w-full animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {barbers.map(b => (
                <div 
                  key={b.id} 
                  onClick={() => setSelectedBarber(b)} 
                  className={`p-4 border rounded-sm cursor-pointer transition-all duration-300 text-center flex flex-col items-center h-full justify-between hover:-translate-y-1
                    ${selectedBarber?.id === b.id 
                      ? 'border-gold bg-gold/5 shadow-[0_0_20px_rgba(212,175,55,0.3)] ring-1 ring-gold' 
                      : 'border-white/10 bg-white/2 hover:border-gold/50 hover:bg-white/5'}`}
                >
                  <div className="mb-3">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-bg-main border border-white/10 rounded-full mx-auto flex items-center justify-center overflow-hidden shadow-lg">
                      <img 
                        src={BARBER_PHOTOS[b.id] || "https://via.placeholder.com/150"} 
                        alt={b.name} 
                        className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-110" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-sm md:text-lg mb-1 text-txt-main uppercase tracking-tight leading-tight">
                      {b.name.replace("PRUEBA", "")} 
                    </h3>
                    <p className="text-[10px] text-gold font-bold uppercase tracking-widest mb-2 truncate px-1">
                      {b.role}
                    </p>
                    <p className="text-txt-muted text-[10px] leading-tight hidden sm:block">
                      {b.specialty}
                    </p>
                  </div>

                  {selectedBarber?.id === b.id && (
                     <div className="mt-3 w-3 h-3 bg-gold rounded-full animate-bounce"></div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 border-t border-white/10 mt-6 pt-6 max-w-4xl mx-auto">
              <button 
                onClick={() => setStep(3)} 
                disabled={!selectedBarber} 
                className="sm:w-3/4 bg-gold text-bg-main p-4 rounded-sm font-black text-sm uppercase tracking-[0.2em] disabled:opacity-30 shadow-xl shadow-gold/20 hover:bg-gold-hover transition-all"
              >
                Ver Agenda de {selectedBarber?.name.split(' ')[0]}
              </button>
              <button onClick={() => setStep(1)} className="sm:w-1/4 border border-white/20 p-4 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all">
                Regresar
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: CALENDARIO Y HORAS */}
        {step === 3 && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="mb-8 p-4 bg-white/3 border-l-4 border-gold flex justify-between items-center">
              <div>
                <p className="text-[10px] text-gold font-bold uppercase tracking-widest">Resumen</p>
                <div className="flex flex-col md:flex-row md:items-center">
                  <p className="text-lg font-bold mb-1 md:mb-0 md:mr-2">{selectedService?.name}</p>
                  <p className="text-lg font-bold"><span className="text-txt-secondary font-light"> con</span> {selectedBarber?.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-gold">${selectedService?.price.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-8 items-start">
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-sm font-bold text-gold uppercase tracking-[0.2em]">1. Elige la Fecha</h3>
                <div className="bg-white/2 p-6 rounded-sm border border-white/10">
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-bg-main border border-white/10 rounded-sm p-4 text-txt-main text-lg focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>
              
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
                            ? 'border-red-600 bg-red-700/50 text-txt-main cursor-not-allowed opacity-40' 
                            : isSelected 
                              ? 'bg-gold text-bg-main border-gold shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-105' 
                              : 'border-white/10 bg-white/2 text-txt-main hover:border-gold hover:text-gold'}`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 border-t border-white/10 mt-6 pt-6">
              <button 
                disabled={!selectedTime}
                className="sm:w-3/4 bg-gold text-bg-main p-4 rounded-sm font-black text-sm uppercase tracking-[0.2em] disabled:opacity-30 shadow-xl shadow-gold/20 hover:bg-gold-hover transition-all"
                onClick={() => setStep(4)}
              >
                Ingresar Datos
              </button>
              <button onClick={() => setStep(2)} className="sm:w-1/4 border border-white/20 p-4 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all">
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
                <button onClick={() => setStep(3)} className="sm:w-1/4 border border-white/20 p-4 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all">
                  Regresar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* PASO 5: ÉXITO */}
        {step === 5 && (
          <div className="text-center py-20 animate-in zoom-in-95 duration-700">
            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-[0_0_30px_rgba(34,197,94,0.2)]">
              ✓
            </div>
            <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter text-txt-main">
              ¡Reserva Solicitada!
            </h2>
            
            {/* CÓDIGO DE RESERVA */}
            {successId && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 inline-block mb-8">
                <p className="text-[10px] text-txt-secondary uppercase tracking-[0.3em] mb-2">Tu Código de Ticket</p>
                <p className="text-4xl font-mono font-bold text-gold">{successId}</p>
              </div>
            )}

            <p className="text-txt-secondary max-w-sm mx-auto mb-10">
              Hemos registrado tu solicitud con éxito. Guarda tu código para seguimiento.
            </p>
            <Link to="/" className="bg-gold text-bg-main py-4 px-10 rounded-sm font-bold uppercase tracking-widest hover:bg-gold-hover transition-all">
              Volver al Inicio
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;